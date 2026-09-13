import { Request, Response } from 'express'
import { ContactService } from '../services/ContactService'
import { AddContactSchema } from '../dto/contact.dto'

const contactService = new ContactService()

export class ContactController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await contactService.listContacts(req.userId!)

      res.status(200).json({
        success: true,
        data: contacts
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_CONTACTS_FAILED',
          message
        }
      })
    }
  }

  async add(req: Request, res: Response): Promise<void> {
    try {
      const result = AddContactSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: result.error.flatten().fieldErrors
          }
        })
        return
      }

      const contact = await contactService.addContact(
        req.userId!,
        result.data.userId
      )

      res.status(201).json({
        success: true,
        data: contact
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({
        success: false,
        error: {
          code: 'ADD_CONTACT_FAILED',
          message
        }
      })
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { contactId } = req.params

      await contactService.removeContact(req.userId!, contactId)

      res.status(200).json({
        success: true,
        data: {
          message: 'Contact removed successfully'
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({
        success: false,
        error: {
          code: 'REMOVE_CONTACT_FAILED',
          message
        }
      })
    }
  }
}
