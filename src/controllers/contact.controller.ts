import { Request, Response } from 'express'
import { ContactService } from '../services/ContactService'
import { AddContactSchema } from '../dto/contact.dto'

const contactService = new ContactService()

export class ContactController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await contactService.listContacts(req.userId!)

      res.status(200).json({
        contacts: contacts.map((c) => ({
          id: c.id,
          owner_id: req.userId!,
          contact_user_id: c.id,
          contact: {
            id: c.id,
            name: c.name
          },
          created_at: new Date().toISOString()
        })),
        total: contacts.length
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(500).json({ error: message })
    }
  }

  async add(req: Request, res: Response): Promise<void> {
    try {
      const result = AddContactSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({ error: 'Invalid request body' })
        return
      }

      const contact = await contactService.addContact(
        req.userId!,
        result.data.contactUserId
      )

      res.status(201).json({
        id: contact.id,
        owner_id: req.userId!,
        contact_user_id: contact.id,
        contact: {
          id: contact.id,
          name: contact.name
        },
        created_at: new Date().toISOString()
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({ error: message })
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { contactId } = req.params

      await contactService.removeContact(req.userId!, contactId)

      res.status(200).json({
        message: 'Contact deleted'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({ error: message })
    }
  }
}
