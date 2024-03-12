# V1.0.1 - Step by Step Guide

> **Written By**: [ﾒΛM](https://github.com/Subham-Maity)

- [MongoDB Setup](#1-mongodb-setup)

### MongoDB Setup
> postgresql to mongodb migration guide
> 
- Change the provider from `postgresql` to `mongodb` in `schema.prisma` file.

- And because id is string so I need to change the type of id from `Int` to `String` in `schema.prisma` file also in all controllers and services.

⇨ **Check This Commit**: [**_Check Here The Difference_**](https://github.com/Subham-Maity/scalable_server_architecture/commit/8a4bbdb5b5bda9c55537287494ae78daafb04017?diff=split&w=1)
- **Note:** These are the all steps to change the database from postgresql to mongodb.

> Remain code you will understand when you follow the commits after [this commit](https://github.com/Subham-Maity/scalable_server_architecture/commit/8a4bbdb5b5bda9c55537287494ae78daafb04017?diff=split&w=1).