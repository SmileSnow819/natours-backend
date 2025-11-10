# 🏔️ Natours 旅游平台 API 文档

## 📌 基本信息

**基础URL**: `http://localhost:8000/api/v1`  
**内容类型**: `application/json`  
**认证方式**: Bearer Token (JWT)

**请求头示例**:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 🔐 认证接口

### 1. 用户注册

**Endpoint**: `POST /users/signup`

**请求体**:

```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "photo": "user.jpg"
}
```

**响应**:

```json
{
  "status": "成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "5f8d0d55b54764421b7156ce",
      "name": "张三",
      "email": "zhangsan@example.com",
      "photo": "user.jpg",
      "role": "user"
    }
  }
}
```

### 2. 用户登录

**Endpoint**: `POST /users/login`

**请求体**:

```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应**:

```json
{
  "status": "成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. 忘记密码

**Endpoint**: `POST /users/forgotPassword`

**请求体**:

```json
{
  "email": "zhangsan@example.com"
}
```

**响应**:

```json
{
  "status": "成功",
  "message": "令牌已经发送到电子邮箱！"
}
```

### 4. 重置密码

**Endpoint**: `PATCH /users/resetPassword/:token`

**请求体**:

```json
{
  "password": "newpassword123",
  "passwordConfirm": "newpassword123"
}
```

**响应**:

```json
{
  "status": "成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👥 用户管理接口

### 1. 获取当前用户信息

**Endpoint**: `GET /users/getMe`  
**认证**: 需要Bearer Token

**响应**:

```json
{
  "status": "success",
  "data": {
    "document": {
      "_id": "5f8d0d55b54764421b7156ce",
      "name": "张三",
      "email": "zhangsan@example.com",
      "photo": "user.jpg",
      "role": "user"
    }
  }
}
```

### 2. 更新用户信息

**Endpoint**: `PATCH /users/updateMe`  
**认证**: 需要Bearer Token

**请求体**:

```json
{
  "name": "李四",
  "photo": "new-photo.jpg"
}
```

**响应**:

```json
{
  "status": "成功",
  "data": {
    "use": {
      "_id": "5f8d0d55b54764421b7156ce",
      "name": "李四",
      "email": "zhangsan@example.com",
      "photo": "new-photo.jpg",
      "role": "user"
    }
  }
}
```

### 3. 注销账户

**Endpoint**: `DELETE /users/deleteMe`  
**认证**: 需要Bearer Token

**响应**: 204 No Content

### 4. 更新密码

**Endpoint**: `PATCH /users/updateMyPassword`  
**认证**: 需要Bearer Token

**请求体**:

```json
{
  "passwordCurrent": "oldpassword123",
  "password": "newpassword123",
  "passwordConfirm": "newpassword123"
}
```

**响应**:

```json
{
  "status": "成功",
  "message": "修改密码成功"
}
```

---

## 🗺️ 旅游路线接口

### 1. 获取所有旅游路线

**Endpoint**: `GET /tours`

**查询参数**:

- `page` - 页码 (默认: 1)
- `limit` - 每页数量 (默认: 10)
- `sort` - 排序字段 (如: price,-ratingsAverage)
- `fields` - 返回字段 (如: name,price,duration)

**响应**:

```json
{
  "status": "success",
  "results": 25,
  "data": {
    "data": [
      {
        "_id": "5c88fa8cf4afda39709c2955",
        "name": "森林探险",
        "duration": 5,
        "maxGroupSize": 25,
        "difficulty": "medium",
        "ratingsAverage": 4.8,
        "ratingsQuantity": 37,
        "price": 1497,
        "summary": "探索神秘的森林之旅",
        "imageCover": "tour-1-cover.jpg"
      }
    ]
  }
}
```

### 2. 获取单个旅游路线

**Endpoint**: `GET /tours/:id`

**响应**:

```json
{
  "status": "success",
  "data": {
    "document": {
      "_id": "5c88fa8cf4afda39709c2955",
      "name": "森林探险",
      "duration": 5,
      "maxGroupSize": 25,
      "difficulty": "medium",
      "ratingsAverage": 4.8,
      "ratingsQuantity": 37,
      "price": 1497,
      "priceDiscount": 1397,
      "summary": "探索神秘的森林之旅",
      "description": "详细的旅游描述...",
      "imageCover": "tour-1-cover.jpg",
      "images": ["image1.jpg", "image2.jpg"],
      "startDates": ["2024-03-01", "2024-04-15"],
      "guides": [
        {
          "_id": "5c8a21d02f8fb814b56fa189",
          "name": "导游张三",
          "photo": "guide1.jpg"
        }
      ],
      "review": [
        {
          "_id": "5c8a34ed14eb5c17645c9108",
          "review": "非常棒的体验！",
          "rating": 5,
          "user": {
            "_id": "5c8a1dfa2f8fb814b56fa189",
            "name": "用户李四",
            "photo": "user1.jpg"
          }
        }
      ]
    }
  }
}
```

### 3. 创建旅游路线

**Endpoint**: `POST /tours`  
**权限**: admin, lead-guide

**请求体**:

```json
{
  "name": "海滩度假",
  "duration": 7,
  "maxGroupSize": 20,
  "difficulty": "easy",
  "price": 1999,
  "summary": "放松的海滩假期",
  "description": "详细的海滩度假描述...",
  "imageCover": "beach-cover.jpg"
}
```

### 4. 更新旅游路线

**Endpoint**: `PATCH /tours/:id`  
**权限**: admin, lead-guide

### 5. 删除旅游路线

**Endpoint**: `DELETE /tours/:id`  
**权限**: admin, lead-guide

### 6. 旅游统计

**Endpoint**: `GET /tours/tours-stats`

**响应**:

```json
{
  "status": "success",
  "results": 3,
  "data": [
    {
      "_id": "easy",
      "numTours": 5,
      "numRatings": 120,
      "avgRating": 4.7,
      "avgPrice": 897,
      "minPrice": 500,
      "maxPrice": 1500
    }
  ]
}
```

### 7. 月度计划

**Endpoint**: `GET /tours/monthly-plan/:year`  
**权限**: admin, lead-guide, guide

**响应**:

```json
{
  "status": "success",
  "results": 12,
  "data": {
    "plan": [
      {
        "month": 3,
        "totalTourStarts": 5,
        "tours": ["森林探险", "海滩度假"]
      }
    ]
  }
}
```

---

## 💬 评论接口

### 1. 获取所有评论

**Endpoint**: `GET /reviews`  
或通过旅游路线: `GET /tours/:tourId/reviews`

**响应**:

```json
{
  "status": "success",
  "results": 15,
  "data": {
    "data": [
      {
        "_id": "5c8a34ed14eb5c17645c9108",
        "review": "非常棒的体验！",
        "rating": 5,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "user": {
          "_id": "5c8a1dfa2f8fb814b56fa189",
          "name": "用户李四",
          "photo": "user1.jpg"
        },
        "tour": "5c88fa8cf4afda39709c2955"
      }
    ]
  }
}
```

### 2. 创建评论

**Endpoint**: `POST /reviews`  
或通过旅游路线: `POST /tours/:tourId/reviews`  
**认证**: 需要Bearer Token  
**权限**: user

**请求体**:

```json
{
  "review": "非常棒的旅游体验！",
  "rating": 5
}
```

### 3. 更新评论

**Endpoint**: `PATCH /reviews/:id`  
**认证**: 需要Bearer Token

### 4. 删除评论

**Endpoint**: `DELETE /reviews/:id`  
**认证**: 需要Bearer Token

---

## 🔧 通用功能

### 过滤和排序

**示例查询**:

```
GET /tours?difficulty=easy&price[lt]=1000&sort=-price&limit=5&page=2
```

**可用操作符**:

- `gt` - 大于
- `gte` - 大于等于
- `lt` - 小于
- `lte` - 小于等于

### 分页

默认每页10条记录，可通过 `limit` 和 `page` 参数调整。

---

## ⚠️ 错误响应

**认证错误**:

```json
{
  "status": "失败了",
  "message": "你没有登录，无权限访问！"
}
```

**验证错误**:

```json
{
  "status": "失败了",
  "message": "ValidationError: 名字最小长度不能超过10"
}
```

**404错误**:

```json
{
  "status": "失败了",
  "message": "没有找到这个id"
}
```

---

## 🚀 快速开始

1. **注册用户**

```bash
curl -X POST http://localhost:8000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","email":"test@example.com","password":"password123","passwordConfirm":"password123"}'
```

2. **登录获取Token**

```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **获取旅游路线**

```bash
curl -X GET http://localhost:8000/api/v1/tours \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📞 支持

如有问题请联系开发团队或查看服务器日志获取详细信息。
