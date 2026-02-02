import { toast as sonnerToast } from "sonner";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastOptions) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Erro", {
        description,
      });
    } else {
      sonnerToast.success(title || "Sucesso", {
        description,
      });
    }
  };

  return { toast };
}
