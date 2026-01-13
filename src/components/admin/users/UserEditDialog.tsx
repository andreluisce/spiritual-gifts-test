'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { UserWithStats, useUpdateUser, useUserApproval } from '@/hooks/useAdminData'

// Validation schema for user editing
const userEditSchema = z.object({
    displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters'),
    role: z.enum(['user', 'manager', 'admin']),
    status: z.enum(['active', 'inactive', 'suspended']),
    approved: z.boolean()
})

type UserEditForm = z.infer<typeof userEditSchema>

interface UserEditDialogProps {
    user: UserWithStats | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function UserEditDialog({ user, open, onOpenChange, onSuccess }: UserEditDialogProps) {
    const { updateUser, updating } = useUpdateUser()
    const { approveUser, rejectUser, updating: approvalUpdating } = useUserApproval()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<UserEditForm>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            displayName: '',
            role: 'user',
            status: 'active',
            approved: false
        }
    })

    const approvedWatch = watch('approved')

    // Reset form when user changes
    React.useEffect(() => {
        if (user) {
            reset({
                displayName: user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || '',
                role: (user.user_metadata?.role as 'user' | 'manager' | 'admin') || 'user',
                status: user.status || 'active',
                approved: user.approved || false
            })
        }
    }, [user, reset])

    const handleSaveUser = async (data: UserEditForm) => {
        if (!user) return

        try {
            const promises = []

            // 1. Update standard fields
            // Check if any standard fields changed to avoid unnecessary calls? Supabase update is cheap.
            promises.push(updateUser(user.id, {
                displayName: data.displayName,
                role: data.role,
                status: data.status
            }))

            // 2. Handle Approval Logic
            if (data.approved !== user.approved) {
                if (data.approved) {
                    promises.push(approveUser(user.id))
                } else {
                    promises.push(rejectUser(user.id, 'Revoked by administrator via User Management'))
                }
            }

            const results = await Promise.all(promises)
            const allSuccess = results.every(r => r.success)
            const errors = results.filter(r => !r.success).map(r => r.error)

            if (allSuccess) {
                onOpenChange(false)
                if (onSuccess) onSuccess()
                // Force refresh to show updated data
                window.location.reload()
            } else {
                console.error('Some updates failed:', errors)
                alert('Some updates failed. Please check the console.')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            alert('Error updating user: ' + error)
        }
    }

    const isBusy = isSubmitting || updating || approvalUpdating

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit User</AlertDialogTitle>
                    <AlertDialogDescription className="line-clamp-2">
                        Update user information and permissions for {user?.email}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit(handleSaveUser)} className="space-y-4 py-4">
                    {/* Display Name */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            {...register('displayName')}
                            placeholder="Enter display name"
                            className={`w-full ${errors.displayName ? 'border-red-500' : ''}`}
                        />
                        {errors.displayName && (
                            <p className="text-xs text-red-500">{errors.displayName.message}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            {...register('role')}
                            className={`w-full px-3 py-2 border rounded-md text-sm bg-background ${errors.role ? 'border-red-500' : ''}`}
                        >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Administrator</option>
                        </select>
                        {errors.role && (
                            <p className="text-xs text-red-500">{errors.role.message}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            {...register('status')}
                            className={`w-full px-3 py-2 border rounded-md text-sm bg-background ${errors.status ? 'border-red-500' : ''}`}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        {errors.status && (
                            <p className="text-xs text-red-500">{errors.status.message}</p>
                        )}
                    </div>

                    {/* Approval Status */}
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="approved"
                            checked={approvedWatch}
                            onCheckedChange={(checked) => setValue('approved', checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="approved" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Approved for Quiz Access
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                User can access restricted assessments
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                        <Button
                            type="submit"
                            disabled={isBusy}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isBusy ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
