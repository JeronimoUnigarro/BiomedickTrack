from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.modules.dashboard.services.dashboard_service import DashboardService
from app.shared.responses import success_response


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(DashboardService(db).stats())
