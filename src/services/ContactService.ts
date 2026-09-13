import { AppDataSource } from '../data-source'
import { Contact } from '../entities/Contact'
import { User } from '../entities/User'

export class ContactService {
  private contactRepo = AppDataSource.getRepository(Contact)
  private userRepo = AppDataSource.getRepository(User)

  async addContact(
    ownerUserId: string,
    contactUserId: string
  ): Promise<{ id: string; name: string }> {
    if (ownerUserId === contactUserId) {
      throw new Error('Cannot add yourself as contact')
    }

    const userExists = await this.userRepo.findOne({ where: { id: contactUserId } })
    if (!userExists) {
      throw new Error('User not found')
    }

    const alreadyExists = await this.contactRepo.findOne({
      where: { ownerId: ownerUserId, contactUserId }
    })
    if (alreadyExists) {
      throw new Error('Contact already exists')
    }

    const contact = this.contactRepo.create({
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      ownerId: ownerUserId,
      contactUserId
    })
    await this.contactRepo.save(contact)

    return { id: userExists.id, name: userExists.name }
  }

  async listContacts(
    ownerUserId: string
  ): Promise<Array<{ id: string; name: string }>> {
    const contacts = await this.contactRepo.find({
      where: { ownerId: ownerUserId }
    })

    const result: Array<{ id: string; name: string }> = []
    for (const contact of contacts) {
      const user = await this.userRepo.findOne({ where: { id: contact.contactUserId } })
      if (user) {
        result.push({ id: user.id, name: user.name })
      }
    }

    return result
  }

  async removeContact(
    ownerUserId: string,
    contactUserId: string
  ): Promise<void> {
    const contact = await this.contactRepo.findOne({
      where: { ownerId: ownerUserId, contactUserId }
    })

    if (!contact) {
      throw new Error('Contact not found')
    }

    await this.contactRepo.remove(contact)
  }

  async isContact(
    ownerUserId: string,
    contactUserId: string
  ): Promise<boolean> {
    const contact = await this.contactRepo.findOne({
      where: { ownerId: ownerUserId, contactUserId }
    })
    return !!contact
  }

  async getContactInfo(
    userId: string
  ): Promise<{ id: string; name: string } | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      return null
    }
    return { id: user.id, name: user.name }
  }
}
