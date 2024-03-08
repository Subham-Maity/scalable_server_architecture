# V1.0.1 - Step by Step Guide

> **Written By**: [ﾒΛM](https://github.com/Subham-Maity)

## TOC

- [1. MongoDB Setup](#1-mongodb-setup)




### 1. MongoDB Setup
> postgresql to mongodb migration guide
> 
- Change the provider from `postgresql` to `mongodb` in `schema.prisma` file.

- And because id is string so I need to change the type of id from `Int` to `String` in `schema.prisma` file also in all controllers and services.

⇨ **Check This Commit**: [Check Here The Difference]()
**Note:** These are the all steps to change the database from postgresql to mongodb.