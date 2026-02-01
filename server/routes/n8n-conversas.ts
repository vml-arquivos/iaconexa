import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ==========================================
// INTERFACES
// ==========================================

interface WhatsAppMessage {
  id: string;
  phone: string;
  direction: 'incoming' | 'outgoing';
  content: string;
  timestamp: string;
  status?: string;
  mediaUrl?: string;
  mediaType?: string;
}

interface Conversation {
  phone: string;
  guardianName?: string;
  studentName?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: WhatsAppMessage[];
}

// ==========================================
// MOCK DATA (Substituir por tabela n8n_conversas)
// ==========================================

const mockConversations: Map<string, WhatsAppMessage[]> = new Map([
  ['11999990001', [
    { id: '1', phone: '11999990001', direction: 'incoming', content: 'Olá, gostaria de saber sobre a mensalidade de dezembro.', timestamp: '2025-12-15T10:30:00', status: 'read' },
    { id: '2', phone: '11999990001', direction: 'outgoing', content: 'Bom dia! A mensalidade de dezembro está em aberto. O valor é R$ 1.200,00 com vencimento dia 10/12.', timestamp: '2025-12-15T10:35:00', status: 'delivered' },
    { id: '3', phone: '11999990001', direction: 'incoming', content: 'Posso pagar até dia 20?', timestamp: '2025-12-15T10:40:00', status: 'read' },
    { id: '4', phone: '11999990001', direction: 'outgoing', content: 'Sim, podemos negociar. Haverá uma multa de 2% após o vencimento.', timestamp: '2025-12-15T10:45:00', status: 'delivered' },
    { id: '5', phone: '11999990001', direction: 'incoming', content: 'Ok, vou pagar amanhã. Obrigado!', timestamp: '2025-12-15T10:50:00', status: 'read' },
  ]],
  ['11999990002', [
    { id: '6', phone: '11999990002', direction: 'outgoing', content: 'Prezada Maria, informamos que a mensalidade de janeiro está em atraso.', timestamp: '2026-01-15T09:00:00', status: 'delivered' },
    { id: '7', phone: '11999990002', direction: 'incoming', content: 'Desculpe, tive um imprevisto. Posso parcelar?', timestamp: '2026-01-15T14:30:00', status: 'read' },
    { id: '8', phone: '11999990002', direction: 'outgoing', content: 'Sim, podemos parcelar em até 3x. Entre em contato com a secretaria.', timestamp: '2026-01-15T14:45:00', status: 'delivered' },
  ]],
  ['11999990003', [
    { id: '9', phone: '11999990003', direction: 'incoming', content: 'Boa tarde! Preciso do boleto de fevereiro.', timestamp: '2026-01-28T15:00:00', status: 'read' },
    { id: '10', phone: '11999990003', direction: 'outgoing', content: 'Boa tarde! Segue o boleto em anexo. Vencimento: 10/02/2026.', timestamp: '2026-01-28T15:10:00', status: 'delivered', mediaUrl: '/uploads/boletos/boleto-fev-2026.pdf', mediaType: 'application/pdf' },
    { id: '11', phone: '11999990003', direction: 'incoming', content: 'Recebi, obrigado!', timestamp: '2026-01-28T15:15:00', status: 'read' },
  ]],
]);

// Mapeamento de telefone para responsável/aluno
const phoneToGuardian: Map<string, { guardianName: string; studentName: string }> = new Map([
  ['11999990001', { guardianName: 'João Silva', studentName: 'Ana Silva' }],
  ['11999990002', { guardianName: 'Maria Santos', studentName: 'Pedro Santos' }],
  ['11999990003', { guardianName: 'Carlos Oliveira', studentName: 'Lucas Oliveira' }],
  ['11999990004', { guardianName: 'Roberto Costa', studentName: 'Julia Costa' }],
  ['11999990005', { guardianName: 'Fernanda Ferreira', studentName: 'Gabriel Ferreira' }],
  ['11999990006', { guardianName: 'Paulo Lima', studentName: 'Mariana Lima' }],
  ['11999990007', { guardianName: 'Amanda Souza', studentName: 'Rafael Souza' }],
]);

// ==========================================
// ROTAS
// ==========================================

/**
 * GET /api/n8n/conversations
 * Lista todas as conversas
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const conversations: Conversation[] = [];

    mockConversations.forEach((messages, phone) => {
      const guardianInfo = phoneToGuardian.get(phone);
      const lastMessage = messages[messages.length - 1];
      
      conversations.push({
        phone,
        guardianName: guardianInfo?.guardianName,
        studentName: guardianInfo?.studentName,
        lastMessage: lastMessage.content,
        lastMessageTime: lastMessage.timestamp,
        unreadCount: messages.filter(m => m.direction === 'incoming' && m.status !== 'read').length,
        messages
      });
    });

    // Ordenar por última mensagem (mais recente primeiro)
    conversations.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    res.json(conversations);
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({ error: 'Erro ao listar conversas' });
  }
});

/**
 * GET /api/n8n/conversations/:phone
 * Retorna histórico de conversa de um telefone específico
 */
router.get('/conversations/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const cleanPhone = phone.replace(/\D/g, '');

    const messages = mockConversations.get(cleanPhone);
    const guardianInfo = phoneToGuardian.get(cleanPhone);

    if (!messages) {
      return res.json({
        phone: cleanPhone,
        guardianName: guardianInfo?.guardianName,
        studentName: guardianInfo?.studentName,
        messages: []
      });
    }

    res.json({
      phone: cleanPhone,
      guardianName: guardianInfo?.guardianName,
      studentName: guardianInfo?.studentName,
      messages
    });
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

/**
 * POST /api/n8n/conversations/:phone/send
 * Envia mensagem via N8N/WhatsApp
 */
router.post('/conversations/:phone/send', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const { content, mediaUrl, mediaType } = req.body;
    const cleanPhone = phone.replace(/\D/g, '');

    if (!content) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }

    const newMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      phone: cleanPhone,
      direction: 'outgoing',
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      mediaUrl,
      mediaType
    };

    // Adicionar à conversa (mock)
    if (!mockConversations.has(cleanPhone)) {
      mockConversations.set(cleanPhone, []);
    }
    mockConversations.get(cleanPhone)!.push(newMessage);

    // TODO: Integrar com N8N webhook para envio real
    // await fetch(process.env.N8N_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phone: cleanPhone, message: content })
    // });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

/**
 * POST /api/n8n/webhook/incoming
 * Webhook para receber mensagens do N8N
 */
router.post('/webhook/incoming', async (req: Request, res: Response) => {
  try {
    const { phone, content, mediaUrl, mediaType, timestamp } = req.body;

    if (!phone || !content) {
      return res.status(400).json({ error: 'Phone e content são obrigatórios' });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const newMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      phone: cleanPhone,
      direction: 'incoming',
      content,
      timestamp: timestamp || new Date().toISOString(),
      status: 'unread',
      mediaUrl,
      mediaType
    };

    // Adicionar à conversa (mock)
    if (!mockConversations.has(cleanPhone)) {
      mockConversations.set(cleanPhone, []);
    }
    mockConversations.get(cleanPhone)!.push(newMessage);

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

/**
 * PATCH /api/n8n/conversations/:phone/read
 * Marca mensagens como lidas
 */
router.patch('/conversations/:phone/read', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const cleanPhone = phone.replace(/\D/g, '');

    const messages = mockConversations.get(cleanPhone);
    if (messages) {
      messages.forEach(m => {
        if (m.direction === 'incoming') {
          m.status = 'read';
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar como lido:', error);
    res.status(500).json({ error: 'Erro ao marcar como lido' });
  }
});

/**
 * GET /api/n8n/search
 * Busca mensagens por conteúdo
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query de busca é obrigatória' });
    }

    const searchLower = (q as string).toLowerCase();
    const results: (WhatsAppMessage & { guardianName?: string; studentName?: string })[] = [];

    mockConversations.forEach((messages, phone) => {
      const guardianInfo = phoneToGuardian.get(phone);
      
      messages.forEach(msg => {
        if (msg.content.toLowerCase().includes(searchLower)) {
          results.push({
            ...msg,
            guardianName: guardianInfo?.guardianName,
            studentName: guardianInfo?.studentName
          });
        }
      });
    });

    // Ordenar por data (mais recente primeiro)
    results.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json(results);
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ error: 'Erro na busca' });
  }
});

export default router;
