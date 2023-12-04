import { Request, Response, Router } from "express";
import { Readable } from "node:stream";
import readline from "readline";

import multer from "multer";
import { client } from "./database/client";

const multerConfig = multer();

const router = Router();

interface Customers {
  index: String;
  id: String;
  firstName: String;
  lastName: String;
  sex: String;
  email: String;
  phone: String;
  dateOfBirth: String;
  jobTitle: String;
}

router.post(
  "/customers",
  multerConfig.single("file"),
  async (req: Request, res: Response) => {
    const { file } = req;
    const { buffer } = file!;

    const readableFile = new Readable();
    readableFile.push(buffer);
    readableFile.push(null);

    const customersLine = readline.createInterface({
      input: readableFile,
    });

    const customers: Customers[] = [];

    for await (let line of customersLine) {
      const customersSplit = line.split(",");

      const customersObj = {
        index: customersSplit[0],
        id: customersSplit[1],
        firstName: customersSplit[2],
        lastName: customersSplit[3],
        sex: customersSplit[4],
        email: customersSplit[5],
        phone: customersSplit[6],
        dateOfBirth: customersSplit[7],
        jobTitle: customersSplit[8],
      };

      customers.push(customersObj);

      await client.customers.create({
        data: {
          ...customersObj,
        },
      });
    }

    return res.json(customers);
  }
);

export { router };
