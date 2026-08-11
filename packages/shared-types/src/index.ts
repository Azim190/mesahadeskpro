export enum WorkType {
  SURVEY_TRANSFER = 'SURVEY_TRANSFER',
  REPORT = 'REPORT',
  SKETCH = 'SKETCH',
  BALADI_TRANSACTION = 'BALADI_TRANSACTION',
  SURVEY_DECISION = 'SURVEY_DECISION',
  PRICE_OFFERS = 'PRICE_OFFERS',
  CONTRACTS = 'CONTRACTS',
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  UNDER_PROCEDURE = 'UNDER_PROCEDURE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum UserRole {
  ADMIN = 'Admin',
  DEPARTMENT_MANAGER = 'DepartmentManager',
  STAFF = 'Staff',
}

export interface TenantDto {
  id: string;
  officeName: string;
  logoUrl?: string;
  primaryColor?: string;
  createdAt: Date;
}

export interface UserDto {
  id: string;
  tenantId: string;
  fullName: string;
  iqamaId: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDto {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  notes?: string;
  createdAt: Date;
}

export interface ProjectDto {
  id: string;
  tenantId: string;
  projectNumber: string;
  projectName: string;
  clientId: string;
  workType: WorkType;
  locationText: string;
  locationLat?: number;
  locationLng?: number;
  progressPercentage: number;
  status: ProjectStatus;
  createdBy: string;
  dateAdded: Date;
  updatedAt: Date;
}

export interface LoginDto {
  iqamaId: string;
  password?: string;
}

export interface VerifyOtpDto {
  iqamaId: string;
  code: string;
}

export interface ResendOtpDto {
  iqamaId: string;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export function validateSaudiId(id: string): boolean {
  if (!/^[12]\d{9}$/.test(id)) {
    return false;
  }
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let d = parseInt(id.charAt(i), 10);
    if (i % 2 === 0) {
      d = d * 2;
      if (d > 9) {
        d = d - 9;
      }
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export interface SyncQueueItemDto {
  id: number;
  entityType: 'PROJECT' | 'CLIENT' | 'PROJECT_DETAILS';
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: unknown;
  createdAt: string;
}

export interface SyncPullResponseDto {
  clients: unknown[];
  projects: unknown[];
  projectDetails: unknown[];
  serverTimestamp: string;
}
