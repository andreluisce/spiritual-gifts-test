'use client'

import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserWithStats, useDeleteUser } from '@/hooks/useAdminData'

interface UserDeleteDialogProps {
    user: UserWithStats | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function UserDeleteDialog({ user, open, onOpenChange, onSuccess }: UserDeleteDialogProps) {
    const { deleteUser, deleting } = useDeleteUser()

    const handleDelete = async () => {
        if (!user) return

        try {
            const result = await deleteUser(user.id)
            if (result.success) {
                onOpenChange(false)
                if (onSuccess) onSuccess()
                window.location.reload()
            } else {
                alert('Failed to delete user: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            alert('Error deleting user: ' + error)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {user?.user_metadata?.name || user?.email}? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting...' : 'Delete User'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
