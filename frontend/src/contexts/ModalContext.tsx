'use client'

import React, { createContext, ReactNode,useContext, useState } from 'react'

type ModalState = {
  [key: string]: boolean
}

type ModalContextType = {
  modals: ModalState
  openModal: (modalKey: string) => void
  closeModal: (modalKey: string) => void
  closeModelAll: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modals, setModals] = useState<ModalState>({})

  const openModal = (modalKey: string) => {
    setModals((prev) => ({ ...prev, [modalKey]: true }))
  }

  const closeModal = (modalKey: string) => {
    setModals((prev) => ({ ...prev, [modalKey]: false }))
  }

  const closeModelAll = () => {
    setModals((prev) => {
      const updatedModals = { ...prev }
      Object.keys(updatedModals).forEach((key) => {
        updatedModals[key] = false
      })
      return updatedModals
    })
  }

  return (
    <ModalContext.Provider
      value={{ modals, openModal, closeModal, closeModelAll }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
