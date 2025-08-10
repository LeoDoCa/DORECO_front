"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@config/context/auth-context"
import { useConfirmAction } from "./useConfirmAction"
import { useApi } from "@hooks/useApi"

export const useInterests = () => {
  const { user, updateUser } = useAuth()
  const { showSuccess, showError } = useConfirmAction()
  const [loading, setLoading] = useState(false)

  const { post } = useApi();

  const addToInterests = useCallback(
    async (objectId) => {
      if (!user) return false;
      setLoading(true);
      try {
        const response = await post(`/api/publications/${objectId}/toggle-favorite/`);
        if (response && response.success && response.data.is_favorite) {
          const currentInterests = user.interests || [];
          if (!currentInterests.includes(objectId)) {
            const updatedInterests = [...currentInterests, objectId];
            updateUser({ interests: updatedInterests });
          }
          showSuccess("Objeto agregado a tus favoritos");
          return true;
        } else {
          showError("No se pudo agregar a favoritos");
          return false;
        }
      } catch (error) {
        showError("Error al agregar a favoritos");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser, showSuccess, showError, post],
  );

  const removeFromInterests = useCallback(
    async (objectId) => {
      if (!user) return false;
      setLoading(true);
      try {
        const response = await post(`/api/publications/${objectId}/toggle-favorite/`);
        if (response && response.success && !response.data.is_favorite) {
          const currentInterests = user.interests || [];
          const updatedInterests = currentInterests.filter((id) => id !== objectId);
          updateUser({ interests: updatedInterests });
          showSuccess("Objeto removido de tus favoritos");
          return false;
        } else {
          showError("No se pudo remover de favoritos");
          return true;
        }
      } catch (error) {
        showError("Error al remover de favoritos");
        return true;
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser, showSuccess, showError, post],
  );

  const isInInterests = useCallback(
    (objectId) => {
      if (!user || !user.interests) return false
      return user.interests.includes(objectId)
    },
    [user],
  )

  const getInterestsCount = useCallback(() => {
    return user?.interests?.length || 0
  }, [user])

  return {
    addToInterests,
    removeFromInterests,
    isInInterests,
    getInterestsCount,
    loading,
    interests: user?.interests || [],
  }
}
