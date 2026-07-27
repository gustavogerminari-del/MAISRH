import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { HRDocument } from '../documents-signature/types';
import { MOCK_DOCUMENTS } from '../documents-signature/mockData';
import { AuditService } from './AuditService';

const COLLECTION_NAME = 'documents';

export class DocumentService {
  static async create(docData: Partial<HRDocument> & { companyId?: string }): Promise<HRDocument> {
    const id = docData.id || `doc-${Date.now()}`;
    const user = auth.currentUser;
    const now = new Date().toISOString().split('T')[0];
    const companyId = docData.companyId || 'emp-001';

    const hrDoc: HRDocument & { companyId: string; createdBy: string; createdAt: string; updatedAt: string; status: string } = {
      id,
      title: docData.title || 'Novo Documento',
      fileName: docData.fileName || 'documento.pdf',
      fileSize: docData.fileSize || '1.0 MB',
      category: docData.category || 'Contrato de Trabalho',
      linkedEntityName: docData.linkedEntityName || 'Geral',
      linkedType: docData.linkedType || 'Colaborador',
      uploadedAt: docData.uploadedAt || now,
      signatureStatus: docData.signatureStatus || 'Pendente de Assinatura',
      signers: docData.signers || [],
      accessPermissions: docData.accessPermissions || {
        canView: true,
        canSign: true,
        canDownload: true,
        canDelete: true
      },
      companyId,
      createdBy: user?.uid || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Ativo'
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, id), hrDoc, { merge: true });
      await AuditService.log({
        action: 'CREATE',
        description: `Documento "${hrDoc.title}" enviado para assinatura`,
        moduleName: 'Documentos',
        targetEntity: 'Documento',
        companyId
      });
    } catch (err) {
      console.warn('Erro ao salvar documento no Firestore:', err);
    }

    return hrDoc;
  }

  static async update(id: string, data: Partial<HRDocument>): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await AuditService.log({
        action: 'UPDATE',
        description: `Status do documento ${id} atualizado`,
        moduleName: 'Documentos',
        targetEntity: 'Documento'
      });
    } catch (err) {
      console.warn('Erro ao atualizar documento no Firestore:', err);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      await AuditService.log({
        action: 'DELETE',
        description: `Documento ${id} excluído`,
        moduleName: 'Documentos',
        targetEntity: 'Documento'
      });
    } catch (err) {
      console.warn('Erro ao excluir documento no Firestore:', err);
    }
  }

  static async getById(id: string): Promise<HRDocument | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return snap.data() as HRDocument;
      }
    } catch (err) {
      console.warn('Erro em DocumentService.getById:', err);
    }
    return MOCK_DOCUMENTS.find(d => d.id === id) || null;
  }

  static async get(id: string): Promise<HRDocument | null> {
    return this.getById(id);
  }

  static async list(companyId?: string): Promise<HRDocument[]> {
    try {
      const q = companyId 
        ? query(collection(db, COLLECTION_NAME), where('companyId', '==', companyId))
        : collection(db, COLLECTION_NAME);
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: HRDocument[] = [];
        snap.forEach(d => list.push(d.data() as HRDocument));
        return list;
      }
    } catch (err) {
      console.warn('Erro em DocumentService.list:', err);
    }
    return MOCK_DOCUMENTS;
  }

  static async search(term: string, companyId?: string): Promise<HRDocument[]> {
    const all = await this.list(companyId);
    const lower = term.toLowerCase();
    return all.filter(d => 
      d.title.toLowerCase().includes(lower) || 
      d.fileName.toLowerCase().includes(lower) ||
      d.linkedEntityName.toLowerCase().includes(lower)
    );
  }

  static async count(companyId?: string): Promise<number> {
    const all = await this.list(companyId);
    return all.length;
  }

  static async paginate(page: number, pageSize: number, companyId?: string): Promise<{ items: HRDocument[]; total: number }> {
    const all = await this.list(companyId);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length
    };
  }
}
