/**
 * PermissionGate Component
 * Sistema Conexa - Security Hardening
 * 
 * Componente para controlar visibilidade de elementos baseado em permissões
 * Implementa lógica "Matriz Audita, Unidade Executa"
 */

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// User Role Types (matching backend)
type UserRole = 
  | 'ADMIN_MATRIZ'
  | 'GESTOR_REDE'
  | 'DIRETOR_UNIDADE'
  | 'COORD_PEDAGOGICO'
  | 'SECRETARIA'
  | 'NUTRICIONISTA'
  | 'PROFESSOR';

// Resource Types
type ResourceType = 
  | 'daily-log' 
  | 'student' 
  | 'class' 
  | 'appointment' 
  | 'material-request' 
  | 'planning'
  | 'unit-settings'
  | 'unit'
  | 'report';

// Action Types
type ActionType = 'read' | 'write' | 'delete';

interface PermissionGateProps {
  children: React.ReactNode;
  resource: ResourceType;
  action: ActionType;
  userRole?: UserRole;
  userUnitId?: string;
  resourceUnitId?: string;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

// Strategic Roles (View-Only Global)
const STRATEGIC_ROLES: UserRole[] = ['ADMIN_MATRIZ', 'GESTOR_REDE'];

// Tactical Roles (Local Authority)
const TACTICAL_ROLES: UserRole[] = ['DIRETOR_UNIDADE', 'COORD_PEDAGOGICO', 'SECRETARIA'];

// Operational Roles (Execution)
const OPERATIONAL_ROLES: UserRole[] = ['NUTRICIONISTA', 'PROFESSOR'];

/**
 * Check if user has permission
 */
function checkPermission(
  userRole: UserRole | undefined,
  resource: ResourceType,
  action: ActionType,
  userUnitId?: string,
  resourceUnitId?: string
): { allowed: boolean; reason?: string } {
  
  if (!userRole) {
    return { allowed: false, reason: 'Usuário não autenticado' };
  }

  // ========================================
  // STRATEGIC ROLES (Global View-Only)
  // ========================================
  if (STRATEGIC_ROLES.includes(userRole)) {
    // READ: Allow access to EVERYTHING
    if (action === 'read') {
      return { allowed: true };
    }

    // WRITE/DELETE: DENY for operational resources
    const operationalResources: ResourceType[] = [
      'daily-log',
      'student',
      'class',
      'appointment',
      'material-request',
      'planning'
    ];

    if (operationalResources.includes(resource)) {
      return { 
        allowed: false, 
        reason: 'Apenas a unidade pode editar este dado' 
      };
    }

    // EXCEPTION: Can edit unit-settings and create units
    if (resource === 'unit-settings' || resource === 'unit') {
      return { allowed: true };
    }

    return { 
      allowed: false, 
      reason: 'Permissão negada para nível estratégico' 
    };
  }

  // ========================================
  // TACTICAL & OPERATIONAL ROLES
  // ========================================
  
  // Must have unitId
  if (!userUnitId) {
    return { 
      allowed: false, 
      reason: 'Usuário não está vinculado a uma unidade' 
    };
  }

  // If resource has unitId, check if it matches
  if (resourceUnitId && resourceUnitId !== userUnitId) {
    return { 
      allowed: false, 
      reason: 'Recurso pertence a outra unidade' 
    };
  }

  // TACTICAL ROLES: Full access within their unit
  if (TACTICAL_ROLES.includes(userRole)) {
    return { allowed: true };
  }

  // OPERATIONAL ROLES: Limited access
  if (OPERATIONAL_ROLES.includes(userRole)) {
    // PROFESSOR: Can manage their own classes
    if (userRole === 'PROFESSOR') {
      if (action === 'read') {
        return { allowed: true };
      }
      return { allowed: true }; // Basic permission
    }

    // NUTRICIONISTA: Can manage health-related data
    if (userRole === 'NUTRICIONISTA') {
      const allowedResources: ResourceType[] = ['daily-log', 'student', 'report'];
      if (allowedResources.includes(resource)) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'Nutricionista só pode acessar dados de saúde' 
      };
    }
  }

  return { 
    allowed: false, 
    reason: 'Permissão não definida' 
  };
}

/**
 * PermissionGate Component
 * 
 * Controla visibilidade de elementos baseado em permissões
 * 
 * @example
 * <PermissionGate resource="daily-log" action="write" userRole={user.role}>
 *   <Button>Editar</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  resource,
  action,
  userRole,
  userUnitId,
  resourceUnitId,
  fallback = null,
  showTooltip = true,
  tooltipMessage
}: PermissionGateProps) {
  
  const permission = checkPermission(userRole, resource, action, userUnitId, resourceUnitId);

  // If allowed, render children normally
  if (permission.allowed) {
    return <>{children}</>;
  }

  // If not allowed and showTooltip is true, wrap in disabled state with tooltip
  if (showTooltip) {
    const message = tooltipMessage || permission.reason || 'Você não tem permissão para esta ação';
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block cursor-not-allowed opacity-50">
              {/* Clone children and disable them */}
              {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    disabled: true,
                    className: `${child.props.className || ''} pointer-events-none`
                  });
                }
                return child;
              })}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If not allowed and no tooltip, render fallback or nothing
  return <>{fallback}</>;
}

/**
 * Hook to check permissions
 */
export function usePermission(
  resource: ResourceType,
  action: ActionType,
  userRole?: UserRole,
  userUnitId?: string,
  resourceUnitId?: string
) {
  const permission = checkPermission(userRole, resource, action, userUnitId, resourceUnitId);
  return permission;
}

export default PermissionGate;
