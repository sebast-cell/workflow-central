from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID, uuid4
from enum import Enum
import datetime

app = FastAPI(
    title="Objetivos e Incentivos API",
    description="API para la gestión de objetivos, tareas e incentivos retributivos",
    version="1.0.0"
)

# --- CORS Middleware ---
# Esto es crucial para permitir que el frontend de Next.js (ej. en localhost:3000)
# se comunique con este backend de FastAPI (en localhost:8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Origen del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------- ENUMS Y AUTH SIMPLIFICADA -------- #
class Role(str, Enum):
    admin = "admin"
    rrhh = "rrhh"
    empleado = "empleado"

class User(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    role: Role

# Simula obtener el usuario actual. En una app real, esto vendría de un token.
def get_current_user() -> User:
    return User(role=Role.admin)

# -------- MODELOS -------- #
class Incentive(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    type: str
    value: str
    period: str
    active: bool
    company_id: UUID = Field(default_factory=uuid4)
    condition_expression: Optional[dict] = None

class Project(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: Optional[str] = None

class Objective(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    description: Optional[str] = None
    type: str
    assigned_to: UUID
    project_id: Optional[UUID] = None
    is_incentivized: bool
    incentive_id: Optional[UUID] = None
    weight: Optional[float] = None
    start_date: str
    end_date: str

class Task(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str
    objective_id: UUID
    is_incentivized: bool = False
    incentive_id: Optional[UUID] = None
    completed: bool = False

# -------- BBDD SIMULADA -------- #
# Llenamos con algunos datos de ejemplo para que la API devuelva algo al iniciar.
INCENTIVES_DB: List[Incentive] = [
    Incentive(id=UUID("a1b2c3d4-0001-0001-0001-000000000001"), name="Bonus Q1 Ventas", type="económico", value="1000", period="trimestral", active=True, company_id=UUID("c1d2e3f4-0000-0000-0000-000000000000")),
    Incentive(id=UUID("a1b2c3d4-0001-0001-0001-000000000002"), name="Días extra por rendimiento", type="días_libres", value="2", period="anual", active=True, company_id=UUID("c1d2e3f4-0000-0000-0000-000000000000")),
]
PROJECTS_DB: List[Project] = [
    Project(id=UUID("b1c2d3e4-0002-0002-0002-000000000001"), name="Rediseño Web Corporativa", description="Modernizar la web principal de la empresa."),
    Project(id=UUID("b1c2d3e4-0002-0002-0002-000000000002"), name="Campaña Marketing Q4", description="Lanzamiento de producto para fin de año."),
]
OBJECTIVES_DB: List[Objective] = [
    Objective(id=UUID("d1e2f3a4-0003-0003-0003-000000000001"), title="Desarrollar componentes UI", description="Crear la librería de componentes en React.", type="individual", assigned_to=UUID("a1b2c3d4-e5f6-7890-1234-567890abcdef"), project_id=UUID("b1c2d3e4-0002-0002-0002-000000000001"), is_incentivized=True, incentive_id=UUID("a1b2c3d4-0001-0001-0001-000000000001"), weight=50, start_date="2024-01-01", end_date="2024-03-31"),
]
TASKS_DB: List[Task] = [
    Task(id=UUID("e1f2a3b4-0004-0004-0004-000000000001"), title="Diseñar botón principal", objective_id=UUID("d1e2f3a4-0003-0003-0003-000000000001"), completed=True),
    Task(id=UUID("e1f2a3b4-0004-0004-0004-000000000002"), title="Crear componente Card", objective_id=UUID("d1e2f3a4-0003-0003-0003-000000000001"), completed=False),
]

# -------- ENDPOINTS -------- #
@app.post("/incentives/", response_model=Incentive, status_code=201)
def create_incentive(incentive: Incentive, user: User = Depends(get_current_user)):
    if user.role not in [Role.admin, Role.rrhh]:
        raise HTTPException(status_code=403, detail="No autorizado")
    INCENTIVES_DB.append(incentive)
    return incentive

@app.get("/incentives/", response_model=List[Incentive])
def list_incentives():
    return INCENTIVES_DB

@app.post("/objectives/", response_model=Objective, status_code=201)
def create_objective(obj: Objective, user: User = Depends(get_current_user)):
    OBJECTIVES_DB.append(obj)
    return obj

@app.get("/objectives/", response_model=List[Objective])
def list_objectives():
    return OBJECTIVES_DB

@app.get("/objectives/{obj_id}/tasks", response_model=List[Task])
def get_tasks_by_objective(obj_id: UUID):
    return [t for t in TASKS_DB if t.objective_id == obj_id]

@app.post("/tasks/", response_model=Task, status_code=201)
def create_task(task: Task):
    TASKS_DB.append(task)
    return task

@app.post("/projects/", response_model=Project, status_code=201)
def create_project(proj: Project):
    PROJECTS_DB.append(proj)
    return proj

@app.get("/projects/", response_model=List[Project])
def list_projects():
    return PROJECTS_DB

@app.get("/tasks/", response_model=List[Task])
def list_tasks():
    return TASKS_DB

@app.get("/objectives/{obj_id}/incentive")
def calculate_incentive_endpoint(obj_id: UUID):
    obj = next((o for o in OBJECTIVES_DB if o.id == obj_id), None)
    if not obj or not obj.is_incentivized or not obj.incentive_id:
        return {"result": 0, "message": "Sin incentivo asociado"}

    incentive = next((i for i in INCENTIVES_DB if i.id == obj.incentive_id), None)
    if not incentive:
        return {"result": 0, "message": "Incentivo no encontrado"}

    tasks = [t for t in TASKS_DB if t.objective_id == obj_id]
    total = len(tasks)
    completed = sum(1 for t in tasks if t.completed)

    if total == 0:
        return {"result": 0, "message": "No hay tareas"}

    ratio = completed / total
    value = float(incentive.value) if incentive.type == 'económico' else incentive.value

    if ratio >= 1:
        return {"result": value, "message": "Incentivo completo"}
    elif ratio >= 0.75:
        return {"result": value * 0.75 if isinstance(value, float) else value, "message": "Incentivo parcial (75%)"}
    else:
        return {"result": 0, "message": "Incentivo no cumplido"}

@app.post("/notify/{user_id}")
def send_notification(user_id: UUID, message: str):
    print(f"Notificación enviada a {user_id}: {message}")
    return {"status": "ok", "message": f"Notificado a {user_id}"}
