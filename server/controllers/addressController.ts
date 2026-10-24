import express from "express";
import { prisma } from "../config/prisma.js";

//Get user addresses
//Get/api/adddresses
export const getAddresses = async (
  req: express.Request,
  res: express.Response,
) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user?.id },
    orderBy: { createdAt: "desc" },
  });

  res.status(201).json({ addresses });
};

// Add address
//POSt/api/addresses
export const addAddress = async (
  req: express.Request,
  res: express.Response,
) => {
  const { label, address, city, state, zip, isDefault, lat, lng } = req.body;

  //Require Coodinate
  if (lat === null || lng === null) {
    return res.status(400).json({
      message:
        "Locatoon coordinates are required.Please allow location access.",
    });
  }

  const currentAddresses = await prisma.address.findMany({
    where: { userId: req.user?.id },
  });

  let makeDefault = isDefault;
  if (currentAddresses.length === 0) makeDefault = true;

  if (makeDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user?.id },
      data: { isDefault: false },
    });
  }

  await prisma.address.create({
    data: {
      userId: req.user?.id as string,
      label,
      address,
      city,
      state,
      zip,
      isDefault: makeDefault,
      lat: Number(lat),
      lng: Number(lng),
    },
  });

  const addresses = await prisma.address.findMany({
    where: { userId: req.user?.id },
    orderBy: { createdAt: "asc" },
  });
  res.status(201).json({ addresses });
};

//Update address
//PUT/api/addresses/:id

export const updateAddress = async (
  req: express.Request,
  res: express.Response,
) => {
  const { label, address, city, state, zip, isDefault, lat, lng } = req.body;

  //Require Coodinate
  if (lat === null || lng === null) {
    return res.status(400).json({
      message:
        "Locatoon coordinates are required.Please allow location access.",
    });
  }

  let makeDefault = isDefault;
  if (makeDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user?.id },
      data: { isDefault: false },
    });
  }

  const data: any = {};
  if (label) data.label = label;
  if (address) data.address = address;
  if (city) data.city = city;
  if (state) data.state = state;
  if (zip) data.zip = zip;
  if (isDefault !== undefined) data.isDefault = isDefault;
  if (lat !== undefined) data.lat = Number(lat);
  if (lng !== undefined) data.lng = Number(lng);

  try {
    await prisma.address.update({
      where: { id: req.params.id as string },
      data,
    });
  } catch (error) {
    return res.status(404).json;
  }

  const addresses = await prisma.address.findMany({
    where: { userId: req.user?.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ addresses });
};

//Delete Adddress
//DELETE/api/addresses/:id
export const deleteAddress = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    await prisma.address.delete({
      where: { id: req.params.id as string },
    });
  } catch (error: any) {
    console.log(error.message);
  }
  const addresses = await prisma.address.findMany({
    where: { userId: req.user?.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ addresses });
};
