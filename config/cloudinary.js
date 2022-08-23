import cloudinary from "cloudinary";
import config from "config";

const cloud_name = config.get("cloudinaryName");
const api_key = config.get("cloudinaryApiKey");
const api_secret = config.get("cloudinaryApiSecret");

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

const uploads = (file, folder) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({
          url: result.url,
        });
      },
      {
        resource_type: "auto",
        folder: folder,
      }
    );
  });
};

export default uploads;
