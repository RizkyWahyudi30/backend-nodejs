import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as z from "zod";
import prisma from "../lib/prisma";

const registerSchema = z.object({
  fullname: z.string().trim().min(1),
  email: z.email().trim(),
  username: z.string().trim().min(7).max(255),
  password: z.string().min(9).max(100),
});

const loginSchema = z.object({
  username: z.string().trim().min(7).max(255),
  password: z.string().min(9).max(100),
});

export const RegisterUser = async (req, res) => {
  const register = registerSchema.safeParse(req.body);

  if (!register.success) {
    return res.status(422).json({
      message: "invalid data",
      errors: register.error.flatten().fieldErrors,
    });
  }

  const { fullname, username, email, password } = register.data;

  const ifExistingData = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { id: true },
  });

  if (ifExistingData) {
    return res.status(409).json({
      message: "Email or Username already used",
    });
  }

  const hashPass = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { fullname, email, username, password: hashPass },
    select: {
      id: true,
      fullname: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });

  return res.status(201).json({
    message: "Register successfully",
    data: user,
  });
};

export const LoginUser = async (req, res) => {
  const login = loginSchema.safeParse(req.body);

  if (!login.success) {
    return res.status(422).json({
      message: "invalid login",
      errors: login.error.flatten().fieldErrors,
    });
  }

  const { username, password } = login.data;

  const user = await prisma.user.findUnique({ where: { username } });
  const valid = user && (await bcrypt.compare(password, user.password));

  if (!valid) {
    return res.status(401).json({ message: "invalid login" });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({ token });
};

export const GetMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      fullname: true,
      username: true,
      email: true,
      bio: true,
      image: true,
      followerCount: true,
      followingCount: true,
      postCount: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({ data: user });
};
