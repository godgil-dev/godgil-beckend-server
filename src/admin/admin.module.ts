import { Module } from '@nestjs/common';
import { DMMFClass } from '@prisma/client/runtime';
import * as AdminJSPrisma from '@adminjs/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import AdminJS from 'adminjs';
import { AdminModule as AdminBroModule } from '@adminjs/nestjs';
import { PrismaModule } from 'src/prisma/prisma.module';
import axios from 'axios';
import userOptions from './options/user.option';

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: '1234',
};

AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
});

const authenticate = async (email: string, password: string) => {
  try {
    const { data } = await axios.post('http://127.0.0.1:3000/auth/login', {
      email,
      password,
    });

    if (data) {
      return Promise.resolve({ email });
    }

    return null;
  } catch (error) {
    console.log(error);
  }
};

@Module({
  imports: [
    AdminBroModule.createAdminAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => {
        // Note: Feel free to contribute to this documentation if you find a Nest-way of
        // injecting PrismaService into AdminJS module
        // `_baseDmmf` contains necessary Model metadata but it is a private method
        // so it isn't included in PrismaClient type
        const dmmf = (prisma as any)._baseDmmf as DMMFClass;
        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [
              {
                resource: { model: dmmf.modelMap['Role'], client: prisma },
                options: {},
              },
              {
                resource: { model: dmmf.modelMap['User'], client: prisma },
                ...userOptions,
              },
              {
                resource: {
                  model: dmmf.modelMap['Permission'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['RolePermission'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['Book'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['Post'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['BookDiscussion'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['ProConDiscussion'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['ProConVote'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['Comment'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['CommentLike'],
                  client: prisma,
                },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap['PostLike'],
                  client: prisma,
                },
                options: {},
              },
            ],
          },
          auth: {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'secret',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
          branding: {
            companyName: 'Imojumo',
            logo: false,
          },
        };
      },
    }),
  ],
})
export class AdminModule {}
