import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../prisma', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => 'hash-gerado'),
}))

import prismaclient from '../../prisma'
import { CreateUserService } from './CreateUserService'

const usuarioCriadoFalso = {
  id: 'uuid-456',
  name: 'João Técnico',
  email: 'joao@allti.com',
  tecnico_id: null,
  instituicaoUnidade: null,
  cliente: null,
  setor: null,
}

describe('CreateUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve criar usuário com sucesso quando email não existe', async () => {
    vi.mocked(prismaclient.user.findFirst).mockResolvedValue(null)
    vi.mocked(prismaclient.user.create).mockResolvedValue(usuarioCriadoFalso as any)

    const service = new CreateUserService()
    const resultado = await service.execute({
      name: 'João Técnico',
      email: 'joao@allti.com',
      password: 'senha123',
    })

    expect(resultado.email).toBe('joao@allti.com')
    expect(resultado.name).toBe('João Técnico')
    expect(prismaclient.user.create).toHaveBeenCalledOnce()
  })

  it('deve lançar erro quando email já está cadastrado', async () => {
    vi.mocked(prismaclient.user.findFirst).mockResolvedValue({
      id: 'uuid-existente',
      name: 'Usuário Existente',
      email: 'joao@allti.com',
      password: 'hash',
      role: 'USER',
      tecnico_id: null,
      cliente_id: null,
      setor_id: null,
      instituicaoUnidade_id: null,
      updated_at: new Date(),
      created_at: new Date(),
    })

    const service = new CreateUserService()

    await expect(
      service.execute({ name: 'João', email: 'joao@allti.com', password: '123' })
    ).rejects.toThrow('Esse email já existe !')
  })

  it('deve lançar erro quando email não é informado', async () => {
    const service = new CreateUserService()

    await expect(
      service.execute({ name: 'João', email: '', password: '123' })
    ).rejects.toThrow('Email Incorreto !')
  })
})
