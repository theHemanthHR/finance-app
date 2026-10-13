import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { TransactionModal } from './TransactionModal'

export function AddTransactionButton({ className, variant = 'primary', label = 'Add transaction' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant={variant} className={className} onClick={() => setOpen(true)}>
        <Plus size={16} /> {label}
      </Button>
      <TransactionModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
