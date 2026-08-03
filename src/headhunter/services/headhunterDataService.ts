import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
import { 
  HeadhunterClient, 
  HeadhunterLead, 
  HeadhunterProposal, 
  HeadhunterContract 
} from '../types';

const COLLECTIONS = {
  CLIENTS: 'headhunter_clients',
  LEADS: 'headhunter_leads',
  PROPOSALS: 'headhunter_proposals',
  CONTRACTS: 'headhunter_contracts'
};

let clientsCache: HeadhunterClient[] = [];
let leadsCache: HeadhunterLead[] = [];
let proposalsCache: HeadhunterProposal[] = [];
let contractsCache: HeadhunterContract[] = [];

export async function syncHeadhunterDataWithFirestore(): Promise<void> {
  try {
    const cliSnap = await getDocs(collection(db, COLLECTIONS.CLIENTS));
    clientsCache = cliSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterClient));
  } catch (err: any) {
    console.error('[HEADHUNTER SYNC]', {
      collection: COLLECTIONS.CLIENTS,
      code: err?.code,
      message: err?.message
    });
  }

  try {
    const leadSnap = await getDocs(collection(db, COLLECTIONS.LEADS));
    leadsCache = leadSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterLead));
  } catch (err: any) {
    console.error('[HEADHUNTER SYNC]', {
      collection: COLLECTIONS.LEADS,
      code: err?.code,
      message: err?.message
    });
  }

  try {
    const propSnap = await getDocs(collection(db, COLLECTIONS.PROPOSALS));
    proposalsCache = propSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterProposal));
  } catch (err: any) {
    console.error('[HEADHUNTER SYNC]', {
      collection: COLLECTIONS.PROPOSALS,
      code: err?.code,
      message: err?.message
    });
  }

  try {
    const ctrSnap = await getDocs(collection(db, COLLECTIONS.CONTRACTS));
    contractsCache = ctrSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterContract));
  } catch (err: any) {
    console.error('[HEADHUNTER SYNC]', {
      collection: COLLECTIONS.CONTRACTS,
      code: err?.code,
      message: err?.message
    });
  }
}

syncHeadhunterDataWithFirestore();

export class HeadhunterDataService {
  static getClients(companyId?: string): HeadhunterClient[] {
    return clientsCache.filter(c => !companyId || c.companyId === companyId || c.empresaId === companyId);
  }

  static async saveClient(client: HeadhunterClient): Promise<HeadhunterClient> {
    const companyId = client.companyId || client.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const clientToSave: HeadhunterClient = {
      ...client,
      companyId,
      empresaId: companyId
    };

    try {
      await setDoc(doc(db, COLLECTIONS.CLIENTS, clientToSave.id), sanitizeFirestoreData(clientToSave), { merge: true });
      clientsCache = [clientToSave, ...clientsCache.filter(c => c.id !== clientToSave.id)];
      return clientToSave;
    } catch (e) {
      console.error('[HEADHUNTER] Erro real ao salvar cliente:', e);
      throw e;
    }
  }

  static getLeads(companyId?: string): HeadhunterLead[] {
    return leadsCache.filter(l => !companyId || l.companyId === companyId || l.empresaId === companyId);
  }

  static async saveLead(lead: HeadhunterLead): Promise<HeadhunterLead> {
    const companyId = lead.companyId || lead.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const leadToSave: HeadhunterLead = {
      ...lead,
      companyId,
      empresaId: companyId
    };

    try {
      await setDoc(doc(db, COLLECTIONS.LEADS, leadToSave.id), sanitizeFirestoreData(leadToSave), { merge: true });
      leadsCache = [leadToSave, ...leadsCache.filter(l => l.id !== leadToSave.id)];
      return leadToSave;
    } catch (e) {
      console.error('[HEADHUNTER] Erro real ao salvar lead:', e);
      throw e;
    }
  }

  static getProposals(companyId?: string): HeadhunterProposal[] {
    return proposalsCache.filter(p => !companyId || p.companyId === companyId || p.empresaId === companyId);
  }

  static async saveProposal(proposal: HeadhunterProposal): Promise<HeadhunterProposal> {
    const companyId = proposal.companyId || proposal.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const proposalToSave: HeadhunterProposal = {
      ...proposal,
      companyId,
      empresaId: companyId
    };

    try {
      await setDoc(doc(db, COLLECTIONS.PROPOSALS, proposalToSave.id), sanitizeFirestoreData(proposalToSave), { merge: true });
      proposalsCache = [proposalToSave, ...proposalsCache.filter(p => p.id !== proposalToSave.id)];
      return proposalToSave;
    } catch (e) {
      console.error('[HEADHUNTER] Erro real ao salvar proposta:', e);
      throw e;
    }
  }

  static getContracts(companyId?: string): HeadhunterContract[] {
    return contractsCache.filter(c => !companyId || c.companyId === companyId || c.empresaId === companyId);
  }

  static async saveContract(contract: HeadhunterContract): Promise<HeadhunterContract> {
    const companyId = contract.companyId || contract.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const contractToSave: HeadhunterContract = {
      ...contract,
      companyId,
      empresaId: companyId
    };

    try {
      await setDoc(doc(db, COLLECTIONS.CONTRACTS, contractToSave.id), sanitizeFirestoreData(contractToSave), { merge: true });
      contractsCache = [contractToSave, ...contractsCache.filter(c => c.id !== contractToSave.id)];
      return contractToSave;
    } catch (e) {
      console.error('[HEADHUNTER] Erro real ao salvar contrato:', e);
      throw e;
    }
  }
}
