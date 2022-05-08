const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const { create } = require("ipfs-http-client");
const mongoose = require("mongoose");
const findRemoveSync = require("find-remove");
const fs = require("fs");
const gs = require("ghostscript-node");
const short = require("short-uuid");
dotenv.config();
const crypto = require("crypto");

const dirname = path.resolve();
const Binance = require("./Model");
var PATH = "uploads/";
var DPATH = "public/temp";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected : ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

connectDB();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "*" }));
app.use(express.json());

const PROJECTID = process.env.PROJECTID;
const PROJECTSECRET = process.env.PROJECTSECRET;

const auth =
  "Basic " + Buffer.from(PROJECTID + ":" + PROJECTSECRET).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const algorithm = "aes-256-ctr";
const secretKey = process.env.SECRETKEY;
const iv = crypto.randomBytes(16);
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted;
};

try {
  fs.mkdirSync(PATH);
} catch (e) {
  if (e.code != "EEXIST") throw e;
}

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

let upload = multer({
  storage: storage,
});

app.post("/api/upload-ipfs", upload.single("file"), async function (req, res) {
  try {
    findRemoveSync(PATH, {
      age: { seconds: 10 },
      files: "*.*",
    });
  } catch (error) {
    console.log(error);
  }

  if (!req.file) {
    console.log("No file is available!");
    return res.send({
      success: false,
    });
  } else {
    const sha256Hasher = crypto.createHmac("sha256", process.env.SECRETKEY);
    const preEncryption = encrypt(Buffer.from(fs.readFileSync(req.file.path)));
    const finalEncryption = `${preEncryption.iv} ${preEncryption.content}`;
    const hash = sha256Hasher
      .update(fs.readFileSync(req.file.path))
      .digest("hex");
    try {
      const ipfsResult = await ipfs.add(
        `${finalEncryption}:${hash}:${req.file.size}`,
        function (err, file) {
          if (err) {
            console.log(err);
          }
        }
      );

      let blockchain = {};

      blockchain.mainFileId = req.body.id || short.generate();
      blockchain["fileName"] = req.file.originalname;
      res.status(200).json({
        mainFileId: req.body.id,
        fileName: req.file.originalname,
        hash: hash,
        size: req.file.size,
        ipfsLink: ipfsResult.path,
      });
    } catch (error) {
      console.log({ error });
      res.status(400).send("Something went wrong!");
    }

    // obj.fileList = fileList;
    // obj.ipfsLink = ipfsLink;
    // obj.ipfsId = ipfsId;
    // obj.hash = hashes;
    // obj.size = sizes;
  }
});

app.post("/api/save-database", async function (req, res) {
  const { uploadIpfsRes } = req.body;

  let updatedCandidate = await Binance.create({
    mainFileId: uploadIpfsRes.mainFileId,
    fileName: uploadIpfsRes.fileName,
    transaction: uploadIpfsRes.transactionHistory,
    hash: uploadIpfsRes.hash.toString(),
    fileSize: uploadIpfsRes.size,
    userId: uploadIpfsRes.userId,
    documentHolderName: uploadIpfsRes.documentHolderName || "",
    issueDate: uploadIpfsRes.issueDate || null,
    expireDate: uploadIpfsRes.expireDate || null,
    refNo: uploadIpfsRes.refNo || null,
  });

  res.status(200).json(updatedCandidate);
});

app.post("/api/get-blockchain-file", async function (req, res) {
  const { id } = req.body;
  let regexp = new RegExp(`${id}`);
  let update = await Binance.find({
    // where: { mainFileId: regexp },
    mainFileId: id,
  });

  res.status(200).send(update);
});

app.post("/api/get-file-database", async function (req, res) {
  const { id } = req.body;

  let file = await Binance.findOne({
    // where: { id: id },
    _id: mongoose.Types.ObjectId(id),
  });
  res.status(200).send(file);
});

app.post("/api/download-file-blockchain", async function (req, res) {
  const { ipfsFileHash } = req.body;
  //for decrypt
  const ipfsData = await axios.post(
    `https://ipfs.infura.io:5001/api/v0/cat?arg=${ipfsFileHash}`
  );
  try {
    findRemoveSync(DPATH, {
      age: { seconds: 10800 },
      files: "*.*",
    });
  } catch (error) {
    console.log(error);
  }
  const myStr = ipfsData.data.split(":");
  let pdfSha256Hash = myStr[0];
  let pdfSize = myStr[2];
  let pdfEncryptedString = myStr[1];
  const hashIvContent = pdfSha256Hash.split(" ");
  const hash = {};
  hash.iv = hashIvContent[0];
  hash.content = hashIvContent[1];
  var dir = `${__dirname}/public`;
  var dir2 = `${__dirname}/public/temp`;
  try {
    fs.mkdirSync(dir);
    fs.mkdirSync(dir2);
  } catch (e) {
    if (e.code != "EEXIST") throw e;
  }
  const decryptbuffer = decrypt(hash);
  //converting buffer to image
  const pdf1 = decryptbuffer;

  try {
    const renderedPages = await gs.renderPDFPagesToPNG(pdf1);
    fs.writeFile(
      `${dir2}/${ipfsFileHash}.jpg`,
      renderedPages[0],
      function (err, written) {
        if (err) console.log(err);
        else {
          console.log("Successfully written");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }

  //done converting
  //res.json(response);
  fs.writeFile(`${dir2}/${ipfsFileHash}.pdf`, decryptbuffer, (err) => {
    if (!err) console.log("Data written");
  });
  res.status(200).json({
    pdf: `temp/${ipfsFileHash}.pdf`,
    image: `temp/${ipfsFileHash}.jpg`,
    size: pdfSize,
    hash: pdfEncryptedString,
  });
});

app.post(
  "/api/get-sha-256Hash",
  upload.single("file"),
  async function (req, res) {
    const sha256Hasher = crypto.createHmac("sha256", process.env.SECRETKEY);
    const hash = sha256Hasher
      .update(fs.readFileSync(req.file.path))
      .digest("hex");
    try {
      findRemoveSync(PATH, {
        age: { seconds: 10 },
        files: "*.*",
      });
    } catch (error) {
      console.log(error);
    }
    res.status(200).send({ hash });
  }
);

app.post("/api/get-dashboard-data", async function (req, res) {
  const { userId } = req.body;
  let data = await Binance.find({
    userId,
  });

  res.status(200).send(data);
});

//

//end here------------------------------------------------------------------------
var dir = `${__dirname}/public`;
app.use(express.static(dir));
const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server running on port ${port} `));
