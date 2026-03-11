"""
用户系统 - API 层
=====================================
RESTful API 接口实现
使用 FastAPI 框架
"""

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import os

from .services import UserService, PointsService, AccountService, TagService
from .services import UserServiceError, PointsServiceError, AccountServiceError, TagServiceError


# ============= Pydantic 模型 =============

# 用户相关模型
class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=50, description="密码")
    phone: Optional[str] = Field(None, pattern=r'^1[3-9]\d{9}$', description="手机号")
    email: Optional[EmailStr] = Field(None, description="邮箱")


class UserLoginRequest(BaseModel):
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class UserUpdateRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    phone: Optional[str] = Field(None, pattern=r'^1[3-9]\d{9}$')
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., min_length=6, max_length=50, description="新密码")


# 积分相关模型
class EarnPointsRequest(BaseModel):
    action_type: str = Field(..., description="动作类型")
    reference_id: Optional[str] = Field(None, description="关联业务 ID")
    description: Optional[str] = Field(None, description="描述")


class SpendPointsRequest(BaseModel):
    points: int = Field(..., gt=0, description="消费积分数")
    action_type: str = Field(..., description="动作类型")
    reference_id: Optional[str] = Field(None, description="关联业务 ID")
    description: Optional[str] = Field(None, description="描述")


# 账户相关模型
class RechargeRequest(BaseModel):
    amount: float = Field(..., gt=0, description="充值金额")
    payment_method: str = Field(..., description="支付方式")
    transaction_no: Optional[str] = Field(None, description="第三方交易流水号")


class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0, description="提现金额")
    bank_account: str = Field(..., description="收款银行账户")
    bank_name: Optional[str] = Field(None, description="银行名称")


class ConfirmTransactionRequest(BaseModel):
    transaction_id: str = Field(..., description="交易 ID")


class RejectWithdrawRequest(BaseModel):
    transaction_id: str = Field(..., description="交易 ID")
    reason: str = Field(..., description="拒绝原因")


# 标签相关模型
class CreateTagRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="标签名称")
    category: Optional[str] = Field(None, description="标签分类")
    color: Optional[str] = Field('#3b82f6', description="标签颜色")
    description: Optional[str] = Field(None, description="标签描述")


class UpdateTagRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[str] = Field(None)
    color: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    is_active: Optional[bool] = Field(None)


class AddTagToUserRequest(BaseModel):
    user_id: str = Field(..., description="用户 ID")
    tag_id: str = Field(..., description="标签 ID")
    source: Optional[str] = Field('manual', description="来源")
    score: Optional[float] = Field(100.0, ge=0, le=100, description="关联强度分数")


class FindUsersByTagsRequest(BaseModel):
    tag_ids: List[str] = Field(..., description="标签 ID 列表")
    operator: Optional[str] = Field('AND', description="逻辑运算符")


# ============= 依赖注入 =============

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    获取当前用户（从 JWT 令牌）
    :param credentials: HTTP 认证凭证
    :return: 用户 ID
    """
    # 这里应该验证 JWT 令牌，简化处理直接返回 user_id
    # 实际应该使用 UserService.verify_token() 验证
    token = credentials.credentials
    # TODO: 实现 JWT 验证逻辑
    return "user-id-from-token"


def get_user_service() -> UserService:
    """获取用户服务实例"""
    return UserService()


def get_points_service() -> PointsService:
    """获取积分服务实例"""
    return PointsService()


def get_account_service() -> AccountService:
    """获取账户服务实例"""
    return AccountService()


def get_tag_service() -> TagService:
    """获取标签服务实例"""
    return TagService()


# ============= API Router =============

api_router = APIRouter(prefix="/api/v1")


# ============= 用户接口 =============

@api_router.post("/users/register", response_model=Dict[str, Any], 
                 summary="用户注册", tags=["用户"])
async def register(request: UserRegisterRequest, 
                  user_service: UserService = Depends(get_user_service)):
    """
    用户注册接口
    - **username**: 用户名（3-50 个字符）
    - **password**: 密码（6-50 个字符）
    - **phone**: 手机号（可选）
    - **email**: 邮箱（可选）
    """
    try:
        result = user_service.register(
            username=request.username,
            password=request.password,
            phone=request.phone,
            email=request.email
        )
        return {
            "code": 0,
            "message": "注册成功",
            "data": result
        }
    except UserServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/users/login", response_model=Dict[str, Any],
                 summary="用户登录", tags=["用户"])
async def login(request: UserLoginRequest, req: Request,
               user_service: UserService = Depends(get_user_service)):
    """
    用户登录接口
    - **username**: 用户名
    - **password**: 密码
    """
    try:
        client_ip = req.client.host
        result = user_service.login(
            username=request.username,
            password=request.password,
            ip=client_ip
        )
        return {
            "code": 0,
            "message": "登录成功",
            "data": result
        }
    except UserServiceError as e:
        raise HTTPException(status_code=401, detail=str(e))


@api_router.get("/users/profile", response_model=Dict[str, Any],
                summary="获取用户资料", tags=["用户"],
                dependencies=[Depends(get_current_user)])
async def get_profile(user_id: str = Depends(get_current_user),
                     user_service: UserService = Depends(get_user_service)):
    """获取当前用户资料"""
    try:
        result = user_service.get_profile(user_id)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except UserServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.put("/users/profile", response_model=Dict[str, Any],
                summary="更新用户资料", tags=["用户"],
                dependencies=[Depends(get_current_user)])
async def update_profile(request: UserUpdateRequest,
                        user_id: str = Depends(get_current_user),
                        user_service: UserService = Depends(get_user_service)):
    """更新当前用户资料"""
    try:
        user_service.update_profile(user_id, request.dict(exclude_unset=True))
        return {
            "code": 0,
            "message": "更新成功",
            "data": None
        }
    except UserServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/users/change-password", response_model=Dict[str, Any],
                 summary="修改密码", tags=["用户"],
                 dependencies=[Depends(get_current_user)])
async def change_password(request: ChangePasswordRequest,
                         user_id: str = Depends(get_current_user),
                         user_service: UserService = Depends(get_user_service)):
    """修改当前用户密码"""
    try:
        user_service.change_password(
            user_id, 
            request.old_password, 
            request.new_password
        )
        return {
            "code": 0,
            "message": "密码修改成功",
            "data": None
        }
    except UserServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============= 积分接口 =============

@api_router.post("/users/points/earn", response_model=Dict[str, Any],
                 summary="获取积分", tags=["积分"],
                 dependencies=[Depends(get_current_user)])
async def earn_points(request: EarnPointsRequest,
                     user_id: str = Depends(get_current_user),
                     points_service: PointsService = Depends(get_points_service)):
    """
    获取积分
    - **action_type**: 动作类型（register, daily_checkin, purchase 等）
    - **reference_id**: 关联业务 ID（可选）
    - **description**: 描述（可选）
    """
    try:
        result = points_service.earn_points(
            user_id=user_id,
            action_type=request.action_type,
            reference_id=request.reference_id,
            description=request.description
        )
        return {
            "code": 0,
            "message": "积分获取成功",
            "data": result
        }
    except PointsServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/users/points/spend", response_model=Dict[str, Any],
                 summary="消费积分", tags=["积分"],
                 dependencies=[Depends(get_current_user)])
async def spend_points(request: SpendPointsRequest,
                      user_id: str = Depends(get_current_user),
                      points_service: PointsService = Depends(get_points_service)):
    """
    消费积分
    - **points**: 消费积分数
    - **action_type**: 动作类型
    - **reference_id**: 关联业务 ID（可选）
    - **description**: 描述（可选）
    """
    try:
        result = points_service.spend_points(
            user_id=user_id,
            points=request.points,
            action_type=request.action_type,
            reference_id=request.reference_id,
            description=request.description
        )
        return {
            "code": 0,
            "message": "积分消费成功",
            "data": result
        }
    except PointsServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/users/points/balance", response_model=Dict[str, Any],
                summary="查询积分余额", tags=["积分"],
                dependencies=[Depends(get_current_user)])
async def get_points_balance(user_id: str = Depends(get_current_user),
                            points_service: PointsService = Depends(get_points_service)):
    """查询当前用户积分余额"""
    try:
        result = points_service.get_balance(user_id)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except PointsServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.get("/users/points/transactions", response_model=Dict[str, Any],
                summary="查询积分交易记录", tags=["积分"],
                dependencies=[Depends(get_current_user)])
async def get_points_transactions(user_id: str = Depends(get_current_user),
                                 points_service: PointsService = Depends(get_points_service),
                                 limit: int = 100):
    """查询当前用户积分交易记录"""
    try:
        result = points_service.get_transactions(user_id, limit)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except PointsServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.get("/points/rules", response_model=Dict[str, Any],
                summary="查询积分规则", tags=["积分"])
async def get_points_rules(rule_type: Optional[str] = None,
                          points_service: PointsService = Depends(get_points_service)):
    """查询积分规则"""
    try:
        result = points_service.get_rules(rule_type)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except PointsServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ============= 账户接口 =============

@api_router.post("/users/balance/recharge", response_model=Dict[str, Any],
                 summary="充值", tags=["账户"],
                 dependencies=[Depends(get_current_user)])
async def recharge(request: RechargeRequest,
                  user_id: str = Depends(get_current_user),
                  account_service: AccountService = Depends(get_account_service)):
    """
    账户充值
    - **amount**: 充值金额
    - **payment_method**: 支付方式
    - **transaction_no**: 第三方交易流水号（可选）
    """
    try:
        result = account_service.recharge(
            user_id=user_id,
            amount=request.amount,
            payment_method=request.payment_method,
            transaction_no=request.transaction_no
        )
        return {
            "code": 0,
            "message": "充值申请成功",
            "data": result
        }
    except AccountServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/users/balance/withdraw", response_model=Dict[str, Any],
                 summary="提现", tags=["账户"],
                 dependencies=[Depends(get_current_user)])
async def withdraw(request: WithdrawRequest,
                  user_id: str = Depends(get_current_user),
                  account_service: AccountService = Depends(get_account_service)):
    """
    账户提现
    - **amount**: 提现金额
    - **bank_account**: 收款银行账户
    - **bank_name**: 银行名称（可选）
    """
    try:
        result = account_service.withdraw(
            user_id=user_id,
            amount=request.amount,
            bank_account=request.bank_account,
            bank_name=request.bank_name
        )
        return {
            "code": 0,
            "message": "提现申请成功",
            "data": result
        }
    except AccountServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/users/balance", response_model=Dict[str, Any],
                summary="查询账户余额", tags=["账户"],
                dependencies=[Depends(get_current_user)])
async def get_balance(user_id: str = Depends(get_current_user),
                     account_service: AccountService = Depends(get_account_service)):
    """查询当前用户账户余额"""
    try:
        result = account_service.get_balance(user_id)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except AccountServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.get("/users/balance/transactions", response_model=Dict[str, Any],
                summary="查询账户交易记录", tags=["账户"],
                dependencies=[Depends(get_current_user)])
async def get_transactions(user_id: str = Depends(get_current_user),
                          account_service: AccountService = Depends(get_account_service),
                          limit: int = 100):
    """查询当前用户账户交易记录"""
    try:
        result = account_service.get_transactions(user_id, limit)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except AccountServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


# 管理员接口：确认充值
@api_router.post("/admin/recharge/confirm", response_model=Dict[str, Any],
                 summary="确认充值", tags=["管理员"])
async def confirm_recharge(request: ConfirmTransactionRequest,
                          account_service: AccountService = Depends(get_account_service)):
    """确认充值（管理员接口）"""
    try:
        account_service.confirm_recharge(request.transaction_id)
        return {
            "code": 0,
            "message": "充值确认成功",
            "data": None
        }
    except AccountServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


# 管理员接口：确认提现
@api_router.post("/admin/withdraw/confirm", response_model=Dict[str, Any],
                 summary="确认提现", tags=["管理员"])
async def confirm_withdraw(request: ConfirmTransactionRequest,
                          account_service: AccountService = Depends(get_account_service)):
    """确认提现（管理员接口）"""
    try:
        account_service.confirm_withdraw(request.transaction_id)
        return {
            "code": 0,
            "message": "提现确认成功",
            "data": None
        }
    except AccountServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


# 管理员接口：拒绝提现
@api_router.post("/admin/withdraw/reject", response_model=Dict[str, Any],
                 summary="拒绝提现", tags=["管理员"])
async def reject_withdraw(request: RejectWithdrawRequest,
                         account_service: AccountService = Depends(get_account_service)):
    """拒绝提现（管理员接口）"""
    try:
        account_service.reject_withdraw(request.transaction_id, request.reason)
        return {
            "code": 0,
            "message": "已拒绝提现",
            "data": None
        }
    except AccountServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============= 标签接口 =============

@api_router.post("/tags", response_model=Dict[str, Any],
                 summary="创建标签", tags=["标签"],
                 dependencies=[Depends(get_current_user)])
async def create_tag(request: CreateTagRequest,
                    tag_service: TagService = Depends(get_tag_service)):
    """创建标签"""
    try:
        result = tag_service.create_tag(
            name=request.name,
            category=request.category,
            color=request.color,
            description=request.description
        )
        return {
            "code": 0,
            "message": "标签创建成功",
            "data": result
        }
    except TagServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/tags", response_model=Dict[str, Any],
                summary="获取所有标签", tags=["标签"])
async def get_all_tags(tag_service: TagService = Depends(get_tag_service),
                      category: Optional[str] = None,
                      is_active: Optional[bool] = True):
    """获取所有标签"""
    try:
        filters = {}
        if category:
            filters['category'] = category
        if is_active is not None:
            filters['is_active'] = is_active
        
        result = tag_service.get_all_tags(filters)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except TagServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.get("/tags/{tag_id}", response_model=Dict[str, Any],
                summary="获取标签详情", tags=["标签"])
async def get_tag(tag_id: str,
                 tag_service: TagService = Depends(get_tag_service)):
    """获取标签详情"""
    try:
        result = tag_service.get_tag(tag_id)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except TagServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.put("/tags/{tag_id}", response_model=Dict[str, Any],
                summary="更新标签", tags=["标签"],
                dependencies=[Depends(get_current_user)])
async def update_tag(tag_id: str, request: UpdateTagRequest,
                    tag_service: TagService = Depends(get_tag_service)):
    """更新标签"""
    try:
        tag_service.update_tag(tag_id, request.dict(exclude_unset=True))
        return {
            "code": 0,
            "message": "标签更新成功",
            "data": None
        }
    except TagServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.delete("/tags/{tag_id}", response_model=Dict[str, Any],
                   summary="删除标签", tags=["标签"],
                   dependencies=[Depends(get_current_user)])
async def delete_tag(tag_id: str,
                    tag_service: TagService = Depends(get_tag_service)):
    """删除标签"""
    try:
        tag_service.delete_tag(tag_id)
        return {
            "code": 0,
            "message": "标签删除成功",
            "data": None
        }
    except TagServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/users/tags", response_model=Dict[str, Any],
                 summary="给用户添加标签", tags=["标签"],
                 dependencies=[Depends(get_current_user)])
async def add_tag_to_user(request: AddTagToUserRequest,
                         tag_service: TagService = Depends(get_tag_service)):
    """给用户添加标签"""
    try:
        result = tag_service.add_tag_to_user(
            user_id=request.user_id,
            tag_id=request.tag_id,
            source=request.source,
            score=request.score
        )
        return {
            "code": 0,
            "message": "标签添加成功",
            "data": result
        }
    except TagServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.delete("/users/{user_id}/tags/{tag_id}", response_model=Dict[str, Any],
                   summary="移除用户标签", tags=["标签"],
                   dependencies=[Depends(get_current_user)])
async def remove_tag_from_user(user_id: str, tag_id: str,
                              tag_service: TagService = Depends(get_tag_service)):
    """移除用户标签"""
    try:
        tag_service.remove_tag_from_user(user_id, tag_id)
        return {
            "code": 0,
            "message": "标签移除成功",
            "data": None
        }
    except TagServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/users/{user_id}/tags", response_model=Dict[str, Any],
                summary="获取用户标签", tags=["标签"])
async def get_user_tags(user_id: str,
                       tag_service: TagService = Depends(get_tag_service)):
    """获取用户的所有标签"""
    try:
        result = tag_service.get_user_tags(user_id)
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except TagServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.post("/users/find-by-tags", response_model=Dict[str, Any],
                 summary="根据标签查询用户", tags=["标签"],
                 dependencies=[Depends(get_current_user)])
async def find_users_by_tags(request: FindUsersByTagsRequest,
                            tag_service: TagService = Depends(get_tag_service)):
    """根据标签查询用户"""
    try:
        result = tag_service.find_users_by_tags(
            tag_ids=request.tag_ids,
            operator=request.operator
        )
        return {
            "code": 0,
            "message": "success",
            "data": result
        }
    except TagServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============= 创建 FastAPI 应用 =============

def create_app() -> FastAPI:
    """创建 FastAPI 应用"""
    app = FastAPI(
        title="用户系统 API",
        description="功能完整、架构全面的用户系统 - RESTful API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # 配置 CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 生产环境应该配置具体的域名
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册路由
    app.include_router(api_router)
    
    @app.get("/health")
    async def health_check():
        """健康检查"""
        return {"status": "healthy", "timestamp": datetime.now()}
    
    return app


app = create_app()
