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

    const leadSnap = await getDocs(collection(db, COLLECTIONS.LEADS));
    leadsCache = leadSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterLead));

    const propSnap = await getDocs(collection(db, COLLECTIONS.PROPOSALS));
    proposalsCache = propSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterProposal));

    const ctrSnap = await getDocs(collection(db, COLLECTIONS.CONTRACTS));
    contractsCache = ctrSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterContract));
  } catch (err) {
    console.warn('Headhunter Data Firestore Sync error:', err);
  }
}

syncHeadhunterDataWithFirestore();

export class HeadhunterDataService {
  static getClients(companyId?: string): HeadhunterClient[] {
    return clientsCache.filter(c => !companyId || c.empresaId === companyId || c.empresaId === 'emp-001');
  }

  static async saveClient(client: HeadhunterClient): Promise<HeadhunterClient> {
    clientsCache = [client, ...clientsCache.filter(c => c.id !== client.id)];
    try {
      await setDoc(doc(db, COLLECTIONS.CLIENTS, client.id), sanitizeFirestoreData(client), { merge: true });
    } catch (e) {
      console.error('Error saving client in Firestore:', e);
    }
    return client;
  }

  static getLeads(companyId?: string): HeadhunterLead[] {
    return leadsCache.filter(l => !companyId || l.empresaId === companyId || l.empresaId === 'emp-001');
  }

  static async saveLead(lead: HeadhunterLead): Promise<HeadhunterLead> {
    leadsCache = [lead, ...leadsCache.filter(l => l.id !== lead.id)];
    try {
      await setDoc(doc(db, COLLECTIONS.LEADS, lead.id), sanitizeFirestoreData(lead), { merge: true });
    } catch (e) {
      console.error('Error saving lead in Firestore:', e);
    }
    return lead;
  }

  static getProposals(companyId?: string): HeadhunterProposal[] {
    return proposalsCache.filter(p => !companyId || p.empresaId === companyId || p.empresaId === 'emp-001');
  }

  static async saveProposal(proposal: HeadhunterProposal): Promise<HeadhunterProposal> {
    proposalsCache = [proposal, ...proposalsCache.filter(p => p.id !== proposal.id)];
    try {
      await setDoc(doc(db, COLLECTIONS.PROPOSALS, proposal.id), sanitizeFirestoreData(proposal), { merge: true });
    } catch (e) {
      console.error('Error saving proposal in Firestore:', e);
    }
    return proposal;
  }

  static getContracts(companyId?: string): HeadhunterContract[] {
    return contractsCache.filter(c => !companyId || c.empresaId === companyId || c.empresaId === 'emp-001');
  }

  static async saveContract(contract: HeadhunterContract): Promise<HeadhunterContract> {
    contractsCache = [contract, ...contractsCache.filter(c => c.id !== contract.id)];
    try {
      await setDoc(doc(db, COLLECTIONS.CONTRACTS, contract.id), sanitizeFirestoreData(contract), { merge: true });
    } catch (e) {
      console.error('Error saving contract in Firestore:', e);
    }
    return contract;
  }
}
