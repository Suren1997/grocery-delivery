import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";

//get admin dashboard data
export const getAdminStats = async (req: Request, res: Response) => {
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    outOfStock,
    totalPartners,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
    }),
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.deliveryPartner.count(),
    prisma.order.findMany({
      where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        deliveryPartner: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    }),
  ]);
  res.json({
    totalOrders,
    totalUsers,
    totalProducts,
    outOfStock,
    totalPartners,
    recentOrders,
  });
};

//get delivery  partners list for admin
export const getDeliveryPartners = async (req: Request, res: Response) => {
  const partners = await prisma.deliveryPartner.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ partners });
};

//create delivery partner profile

export const createDeliveryPartner = async (req: Request, res: Response) => {
  const { email, name, password, phone, vehicleType } = req.body;
  if (!name || !email || !password || !phone || !vehicleType) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const partner = await prisma.deliveryPartner.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      vehicleType,
    },
  });
  res.status(200).json({ partner });
};

//update delivery partner profile

export const updateDeliveryPartner = async (req: Request, res: Response) => {
  const { name, phone, vehicleType, isActive } = req.body;
  const data: any = {};

  if (name) data.name = name;
  if (phone) data.phone = phone;
  if (vehicleType) data.vehicleType = vehicleType;
  if (isActive !== undefined) data.isActive = isActive;

  try {
    const partner = await prisma.deliveryPartner.update({
      where: { id: req.params.id as string },
      data,
    });
    res.json({ partner });
  } catch (error) {
    res.status(404).json({ message: " Delivery partner not found" });
  }
};

//assign delivery partner to order
export const assignDeliveryPartner = async (req: Request, res: Response) => {
  const { patnerId } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id as string },
  });

  const partner = await prisma.deliveryPartner.findUnique({
    where: { id: patnerId },
  });

  const otp = String(Math.floor(100000 + Math.random() * 900000));

  let status = order!.status;

  const history: any[] = Array.isArray(order?.statusHistory)
    ? order?.statusHistory
    : [];

  if (order!.status === "Placed" || order!.status === "Confirmed") {
    status = "Assigned";
    history.push({
      status: "Assigned",
      note: `Assigned to ${partner!.name}`,
      timestamp: new Date(),
    });
  }

  await prisma.order.update({
    where: { id: order!.id },
    data: {
      deliveryPartnerId: patnerId!.id,
      status,
      statusHistory: history,
      deliveryOtp: otp,
    },
  });
  res.json({ order });
};
