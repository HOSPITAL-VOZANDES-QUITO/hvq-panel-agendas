"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { COLORS } from "@/lib/constants"

interface CustomAlertProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: "success" | "error" | "warning" | "info"
  showConfirmButton?: boolean
  confirmText?: string
  onConfirm?: () => void
}

export function CustomAlert({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  showConfirmButton = true,
  confirmText = "Aceptar",
  onConfirm
}: CustomAlertProps) {
  // No necesitamos bloquear el scroll ya que no hay overlay

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" style={{ color: COLORS.SUCCESS }} />
      case "error":
        return <AlertCircle className="h-5 w-5" style={{ color: COLORS.ERROR }} />
      case "warning":
        return <AlertCircle className="h-5 w-5" style={{ color: COLORS.WARNING }} />
      default:
        return <Info className="h-5 w-5" style={{ color: COLORS.INFO }} />
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-sm w-auto min-w-[320px]">
        <div className="p-5">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              {title && (
                <h3 className="text-base font-semibold mb-2" style={{ color: COLORS.TEXT_DARK }}>
                  {title}
                </h3>
              )}
              <p className="text-sm leading-relaxed" style={{ color: COLORS.TEXT_DARK }}>
                {message}
              </p>
            </div>
          </div>
          
          {showConfirmButton && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleConfirm}
                className="px-4 py-2 text-white font-medium rounded-md transition-colors text-sm"
                style={{
                  backgroundColor: COLORS.PRIMARY,
                  color: COLORS.TEXT_LIGHT,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.PRIMARY_HOVER
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.PRIMARY
                }}
              >
                {confirmText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
