import bcryptjs from "bcryptjs";
import statusCodes from "http-status-codes"
import { prisma } from "../../lib/prisma";
import AppError from "../../helper/AppError";
import { Prisma, UserRole, UserStatus } from "../../generated/client";

const createUserService = async (payload: Prisma.UserCreateInput) => {
    const { email, password, ...rest } = payload;

    // Check if user already exists
    const isExistingUser = await prisma.user.findUnique({
        where: { email }
    });

 

    // Hash the password
    const hashPassword = await bcryptjs.hash(
        password as string,
        Number(process.env.BCRYPT_SALT_ROUNDS) || 12
    );

    // Create user with hashed password
    const user = await prisma.user.create({
        data: {
            ...rest,
            email,
            password: hashPassword
        }
    });

    // Remove password from returned user object for security
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
}


const updateUserService = async (
  id: string,
  payload: Partial<Prisma.UserUpdateInput>
) => {
  const { email, password, ...rest } = payload;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new AppError(404, "User not found");
  }



  // Check if email is being updated
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({ where: { email:email as string } });
    if (emailExists) {
      throw new AppError(400, "Email already taken");
    }
  }

  let hashedPassword = undefined;
  if (password) {
    hashedPassword = await bcryptjs.hash(
      password as string,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 12
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...rest,
      ...(email && { email:email as string }),
      ...(hashedPassword && { password: hashedPassword }),
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};



const getMyProfile = async (user: any) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.userEmail,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            role: true,
            status: true
        }
    })

    let profileData;

    if (userInfo.role === UserRole.ADMIN) {
        profileData = await prisma.user.findUnique({
            where: {
                email: userInfo.email
            }
        })
    }
    else if (userInfo.role === UserRole.GUIDE) {
        profileData = await prisma.user.findUnique({
            where: {
                email: userInfo.email
            }
        })
    }
    else if (userInfo.role === UserRole.TOURIST) {
        profileData = await prisma.user.findUnique({
            where: {
                email: userInfo.email
            }
        })
    }

    return {
        ...userInfo,
        ...profileData
    };

};


export const UserService = {
    createUserService,
    updateUserService,
    getMyProfile
}