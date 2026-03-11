import type { Edge } from 'reactflow'
import type { CustomNode, ApiConfig, ServiceConfig, RepositoryConfig, DatabaseConfig } from './types'

export const generateFastAPI = (nodes: CustomNode[], edges: Edge[]) => {
  const apis = nodes.filter(n => n.data.type === 'api')
  const services = nodes.filter(n => n.data.type === 'service')
  const repositories = nodes.filter(n => n.data.type === 'repository')
  const databases = nodes.filter(n => n.data.type === 'database')

  let routerCode = ''
  let serviceCode = ''
  let repositoryCode = ''
  let modelCode = ''
  let configCode = ''

  apis.forEach(api => {
    const cfg = api.data.config as ApiConfig
    const connectedServices = edges
      .filter(e => e.source === api.id)
      .map(e => nodes.find(n => n.id === e.target))
      .filter(Boolean) as CustomNode[]

    const serviceCall = connectedServices.length > 0
      ? `${(connectedServices[0].data.config as ServiceConfig).functionName}()`
      : 'pass'

    routerCode += `
@router.${cfg.method.toLowerCase()}("${cfg.route}")
async def ${cfg.name.toLowerCase().replace(/\s+/g, '_')}():
    """${cfg.description}"""
    return await ${serviceCall}
`
  })

  services.forEach(service => {
    const cfg = service.data.config as ServiceConfig
    const connectedRepos = edges
      .filter(e => e.source === service.id)
      .map(e => nodes.find(n => n.id === e.target))
      .filter(Boolean) as CustomNode[]

    const repoCall = connectedRepos.length > 0
      ? `${(connectedRepos[0].data.config as RepositoryConfig).name.toLowerCase()}`
      : 'pass'

    serviceCode += `
async def ${cfg.functionName}():
    """${cfg.description}"""
    result = await ${repoCall}.get_all()
    return result
`
  })

  repositories.forEach(repo => {
    const cfg = repo.data.config as RepositoryConfig

    repositoryCode += `
class ${cfg.name}:
    """Repository for ${cfg.entity}"""
    
    def __init__(self, db: Database):
        self.db = db
    
${cfg.operations.includes('create') ? `    async def create(self, item: ${cfg.entity}) -> ${cfg.entity}:
        self.db.add(item)
        await self.db.commit()
        return item
` : ''}${cfg.operations.includes('read') ? `    async def get_all(self) -> List[${cfg.entity}]:
        return await self.db.query(${cfg.entity}).all()
` : ''}${cfg.operations.includes('update') ? `    async def update(self, id: int, item: ${cfg.entity}) -> ${cfg.entity}:
        existing = await self.db.get(${cfg.entity}, id)
        if existing:
            for key, value in item.dict().items():
                setattr(existing, key, value)
            await self.db.commit()
        return existing
` : ''}${cfg.operations.includes('delete') ? `    async def delete(self, id: int) -> bool:
        existing = await self.db.get(${cfg.entity}, id)
        if existing:
            await self.db.delete(existing)
            await self.db.commit()
            return True
        return False
` : ''}
`
  })

  databases.forEach(db => {
    const cfg = db.data.config as DatabaseConfig
    configCode += `
# Database: ${cfg.name}
# Type: ${cfg.type}
# Host: ${cfg.host}:${cfg.port}
DATABASE_URL = "${cfg.type}://${cfg.host}:${cfg.port}/${cfg.name}"
`
  })

  modelCode = `
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Models generated from architecture
`

  return {
    'main.py': `from fastapi import FastAPI
from app.router import router
from app.database import engine, Base

app = FastAPI(title="Generated API")

app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
`,
    'app/router.py': `from fastapi import APIRouter
from app.service import ${services.map(s => (s.data.config as ServiceConfig).functionName).join(', ')}

router = APIRouter()
${routerCode}
`,
    'app/service.py': `from app.repository import ${repositories.map(r => (r.data.config as RepositoryConfig).name).join(', ')}
${serviceCode}
`,
    'app/repository.py': `from typing import List
from app.database import Database
from app.models import ${repositories.map(r => (r.data.config as RepositoryConfig).entity).join(', ')}

${repositoryCode}
`,
    'app/models.py': modelCode,
    'app/database.py': `from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
${configCode}

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Database:
    def __init__(self):
        self.db = SessionLocal()
`,
    'app/__init__.py': '',
    'requirements.txt': `fastapi>=0.100.0
uvicorn>=0.23.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
`,
  }
}
