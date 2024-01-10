import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { Collection } from "../../database/models.js";
import { Config } from "../../config/config.js";

const createCollection = async (req, res) => {
  const { EthUser, name, tag } = req.body;
  const imageLinks = req.files.map((file) => `/images/${file.filename}`);
  try {
    await Collection.insertMany({
      EthUser: EthUser,
      CollectionName: name,
      CollectionTag: tag,
      CollectionImages: {
        one: `${Config.Server.HOST}${imageLinks[0]}`,
        two: `${Config.Server.HOST}${imageLinks[1]}`,
        Three: `${Config.Server.HOST}${imageLinks[2]}`,
        four: `${Config.Server.HOST}${imageLinks[3]}`,
      },
      NFTs: [],
      createdTime: new Date().getTime(),
    });
    return res
      .status(200)
      .json({ success: true, message: "Collection created successfully ! 🎉" });
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .json({ success: false, message: "Error found in (createCollection)" });
  }
};

const getCollectionImages = async (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, `../public/images/${imageName}`);

  const readStream = fs.createReadStream(imagePath);
  readStream.on("error", (e) => {
    res.send("image not found");
  });

  readStream.pipe(res);
};

const getCollectionsByUser = async (req, res) => {
  const { EthUser } = req.body;
  try {
    const result = await Collection.find({
      EthUser: EthUser,
    });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const getCollections = async (req, res) => {
  const { search, category } = req.body;
  try {
    const result = await Collection.find({
      CollectionName: { $regex: new RegExp(search, "i") },
      CollectionTag: {
        $regex: new RegExp(category == "all" ? "" : category, "i"),
      },
    });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const getCollectionDetailsById = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Collection.findById(id);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const getCollectionById = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Collection.findById(id);
    return res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const updateCollectionById = async (req, res) => {
  const updatedCollection = req.body;

  const imageLinks = req.files.map((file) => {
    return {
      index: file.fieldname.split("[")[1].split("]")[0],
      link: `/images/${file.filename}`,
    };
  });

  try {
    const result = await Collection.findByIdAndUpdate(
      updatedCollection._id,
      {
        CollectionName: updatedCollection.CollectionName,
        CollectionTag: updatedCollection.CollectionTag,
        CollectionImages: {
          one: `${
            imageLinks.find((i) => i.index === "one")
              ? Config.Server.HOST +
                imageLinks.find((i) => i.index === "one").link
              : updatedCollection.CollectionImages.one
          }`,
          two: `${
            imageLinks.find((i) => i.index === "two")
              ? Config.Server.HOST +
                imageLinks.find((i) => i.index === "two").link
              : updatedCollection.CollectionImages.two
          }`,
          Three: `${
            imageLinks.find((i) => i.index === "Three")
              ? Config.Server.HOST +
                imageLinks.find((i) => i.index === "Three").link
              : updatedCollection.CollectionImages.Three
          }`,
          four: `${
            imageLinks.find((i) => i.index === "four")
              ? Config.Server.HOST +
                imageLinks.find((i) => i.index === "four").link
              : updatedCollection.CollectionImages.four
          }`,
        },
        NFTs: updatedCollection.NFTs[0] === "0" ? [] : updatedCollection.NFTs,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Collection updated successfully ! 🎉" });
  } catch (error) {
    console.log(error);
  }
};

const getFewCollections = async (req, res) => {
  try {
    const result = await Collection.find(
      {},
      {
        CollectionImages: {
          one: 1,
        },
        CollectionTag: 1,
        CollectionName: 1,
        createdTime: 1,
        EthUser: 1,
      }
    )
      .sort({ createdTime: -1 })
      .limit(4);
    return res.send(result);
  } catch (error) {
    console.log(error);
  }
};

export {
  createCollection,
  getCollectionsByUser,
  getCollectionById,
  getCollections,
  getCollectionImages,
  updateCollectionById,
  getCollectionDetailsById,
  getFewCollections,
};
