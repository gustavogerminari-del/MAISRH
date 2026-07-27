import { PayrollPeriod, Paystub, ESocialEvent } from '../types/payroll';
import { 
  calculateINSS, 
  calculateIRRF, 
  calculateFGTS, 
  calculateEmployerCharges, 
  generateDigitalHash 
} from '../services/payrollCalculations';

export const INITIAL_PAYROLL_PERIODS: PayrollPeriod[] = [
  {
    id: 'per-2026-07',
    referenceMonth: '2026-07',
    year: 2026,
    month: 7,
    type: 'Mensal',
    status: 'Aberto',
    totalEmployees: 5,
    totalGross: 38250.00,
    totalDiscounts: 7412.50,
    totalNet: 30837.50,
    totalFGTS: 3060.00,
    totalPatronal: 10633.50,
    paystubsCount: 5,
    paystubsSignedCount: 3,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'per-2026-06',
    referenceMonth: '2026-06',
    year: 2026,
    month: 6,
    type: 'Mensal',
    status: 'Fechado',
    closedAt: '2026-07-02T18:30:00Z',
    closedBy: 'Carlos Eduardo Santos (DP)',
    totalEmployees: 5,
    totalGross: 37500.00,
    totalDiscounts: 7120.00,
    totalNet: 30380.00,
    totalFGTS: 3000.00,
    totalPatronal: 10425.00,
    paystubsCount: 5,
    paystubsSignedCount: 5,
    updatedAt: '2026-07-02T18:30:00Z'
  },
  {
    id: 'per-2026-05',
    referenceMonth: '2026-05',
    year: 2026,
    month: 5,
    type: 'Mensal',
    status: 'Fechado',
    closedAt: '2026-06-03T17:15:00Z',
    closedBy: 'Carlos Eduardo Santos (DP)',
    totalEmployees: 4,
    totalGross: 31200.00,
    totalDiscounts: 5890.00,
    totalNet: 25310.00,
    totalFGTS: 2496.00,
    totalPatronal: 8673.60,
    paystubsCount: 4,
    paystubsSignedCount: 4,
    updatedAt: '2026-06-03T17:15:00Z'
  }
];

export const INITIAL_PAYSTUBS: Paystub[] = [
  // 1. Carlos Eduardo Santos (Recrutador Sênior / DP)
  (() => {
    const salarioBase = 8500.00;
    const horasExtras50 = 386.36; // 10 horas extras 50%
    const dsrHE = 77.27;
    const gross = salarioBase + horasExtras50 + dsrHE; // R$ 8.963,63
    const inssCalc = calculateINSS(gross);
    const irrfCalc = calculateIRRF(gross, inssCalc.amount, 2, 0); // 2 dependentes
    const vtDesconto = 320.00;
    const vrDesconto = 150.00;
    const totalDescontos = Number((inssCalc.amount + irrfCalc.amount + vtDesconto + vrDesconto).toFixed(2));
    const valorLiquido = Number((gross - totalDescontos).toFixed(2));
    const fgtsCalc = calculateFGTS(gross);
    const employer = calculateEmployerCharges(gross);

    return {
      id: 'stub-2026-07-001',
      periodId: 'per-2026-07',
      periodName: 'Folha Mensal - Julho / 2026',
      employeeId: 'emp-001',
      employeeName: 'Carlos Eduardo Santos',
      cpf: '123.456.789-00',
      cargo: 'Recrutador Sênior & Coord. DP',
      departamento: 'Gente & Gestão',
      admissaoDate: '2024-03-15',
      bancoInfo: {
        banco: '341 - Itaú Unibanco',
        agencia: '1234',
        conta: '56789-0',
        tipoConta: 'Corrente',
        pix: '123.456.789-00'
      },
      salarioBase,
      diasTrabalhados: 30,
      dependentsCount: 2,
      pensaoAlimenticiaValue: 0,
      items: [
        { id: '1', code: '1001', name: 'Salário Base', type: 'Provento', reference: '30 dias', amount: salarioBase },
        { id: '2', code: '1002', name: 'Horas Extras 50%', type: 'Provento', reference: '10:00 hrs', amount: horasExtras50 },
        { id: '3', code: '1007', name: 'DSR s/ Horas Extras', type: 'Provento', reference: 'Ref. DSR', amount: dsrHE },
        { id: '4', code: '5001', name: 'INSS', type: 'Desconto', reference: `${inssCalc.effectiveRate}%`, amount: inssCalc.amount },
        { id: '5', code: '5002', name: 'IRRF', type: 'Desconto', reference: `${irrfCalc.ratePercent}% (2 dep.)`, amount: irrfCalc.amount },
        { id: '6', code: '5003', name: 'Vale Transporte (Desc 6%)', type: 'Desconto', reference: 'VT Fretado', amount: vtDesconto },
        { id: '7', code: '5004', name: 'Vale Refeição (Coparticipação)', type: 'Desconto', reference: 'VR Alelo', amount: vrDesconto },
        { id: '8', code: '9001', name: 'Base do FGTS (Informativa)', type: 'Informativa', reference: 'Base', amount: gross },
        { id: '9', code: '9002', name: 'FGTS do Mês (8% Informativo)', type: 'Informativa', reference: '8,0%', amount: fgtsCalc.amount }
      ],
      totalProventos: Number(gross.toFixed(2)),
      totalDescontos,
      valorLiquido,
      baseINSS: inssCalc.base,
      valorINSS: inssCalc.amount,
      baseIRRF: irrfCalc.base,
      valorIRRF: irrfCalc.amount,
      baseFGTS: fgtsCalc.base,
      valorFGTS: fgtsCalc.amount,
      employerCharges: employer,
      statusAssinatura: 'Assinado Digitalmente',
      dataAssinatura: '2026-07-25T14:30:00Z',
      hashDigital: generateDigitalHash('stub-2026-07-001', '123.456.789-00', '2026-07-25T14:30:00Z'),
      ipAssinatura: '189.120.45.12'
    };
  })(),

  // 2. Juliana Martins (Analista Tech)
  (() => {
    const salarioBase = 6200.00;
    const gross = salarioBase;
    const inssCalc = calculateINSS(gross);
    const irrfCalc = calculateIRRF(gross, inssCalc.amount, 0, 0);
    const vtDesconto = 280.00;
    const totalDescontos = Number((inssCalc.amount + irrfCalc.amount + vtDesconto).toFixed(2));
    const valorLiquido = Number((gross - totalDescontos).toFixed(2));
    const fgtsCalc = calculateFGTS(gross);
    const employer = calculateEmployerCharges(gross);

    return {
      id: 'stub-2026-07-002',
      periodId: 'per-2026-07',
      periodName: 'Folha Mensal - Julho / 2026',
      employeeId: 'emp-002',
      employeeName: 'Juliana Martins',
      cpf: '234.567.890-11',
      cargo: 'Analista de RH Tech',
      departamento: 'Gente & Gestão',
      admissaoDate: '2024-08-01',
      salarioBase,
      diasTrabalhados: 30,
      dependentsCount: 0,
      pensaoAlimenticiaValue: 0,
      items: [
        { id: '1', code: '1001', name: 'Salário Base', type: 'Provento', reference: '30 dias', amount: salarioBase },
        { id: '2', code: '5001', name: 'INSS', type: 'Desconto', reference: `${inssCalc.effectiveRate}%`, amount: inssCalc.amount },
        { id: '3', code: '5002', name: 'IRRF', type: 'Desconto', reference: `${irrfCalc.ratePercent}%`, amount: irrfCalc.amount },
        { id: '4', code: '5003', name: 'Vale Transporte', type: 'Desconto', reference: 'VT', amount: vtDesconto }
      ],
      totalProventos: salarioBase,
      totalDescontos,
      valorLiquido,
      baseINSS: inssCalc.base,
      valorINSS: inssCalc.amount,
      baseIRRF: irrfCalc.base,
      valorIRRF: irrfCalc.amount,
      baseFGTS: fgtsCalc.base,
      valorFGTS: fgtsCalc.amount,
      employerCharges: employer,
      statusAssinatura: 'Assinado Digitalmente',
      dataAssinatura: '2026-07-26T09:15:00Z',
      hashDigital: generateDigitalHash('stub-2026-07-002', '234.567.890-11', '2026-07-26T09:15:00Z'),
      ipAssinatura: '201.88.90.3'
    };
  })(),

  // 3. Fernando Souza (Engenheiro de Segurança / Operações - Com Periculosidade 30%)
  (() => {
    const salarioBase = 7500.00;
    const periculosidade = 2250.00; // 30%
    const gross = salarioBase + periculosidade; // 9750.00
    const inssCalc = calculateINSS(gross);
    const irrfCalc = calculateIRRF(gross, inssCalc.amount, 1, 0);
    const totalDescontos = Number((inssCalc.amount + irrfCalc.amount).toFixed(2));
    const valorLiquido = Number((gross - totalDescontos).toFixed(2));
    const fgtsCalc = calculateFGTS(gross);
    const employer = calculateEmployerCharges(gross);

    return {
      id: 'stub-2026-07-003',
      periodId: 'per-2026-07',
      periodName: 'Folha Mensal - Julho / 2026',
      employeeId: 'emp-003',
      employeeName: 'Fernando Souza',
      cpf: '345.678.901-22',
      cargo: 'Engenheiro de Campo / Operações',
      departamento: 'Operações e Logística',
      admissaoDate: '2023-01-10',
      salarioBase,
      diasTrabalhados: 30,
      dependentsCount: 1,
      pensaoAlimenticiaValue: 0,
      items: [
        { id: '1', code: '1001', name: 'Salário Base', type: 'Provento', reference: '30 dias', amount: salarioBase },
        { id: '2', code: '1006', name: 'Adicional de Periculosidade', type: 'Provento', reference: '30% Base', amount: periculosidade },
        { id: '3', code: '5001', name: 'INSS', type: 'Desconto', reference: `${inssCalc.effectiveRate}%`, amount: inssCalc.amount },
        { id: '4', code: '5002', name: 'IRRF', type: 'Desconto', reference: `${irrfCalc.ratePercent}% (1 dep.)`, amount: irrfCalc.amount }
      ],
      totalProventos: gross,
      totalDescontos,
      valorLiquido,
      baseINSS: inssCalc.base,
      valorINSS: inssCalc.amount,
      baseIRRF: irrfCalc.base,
      valorIRRF: irrfCalc.amount,
      baseFGTS: fgtsCalc.base,
      valorFGTS: fgtsCalc.amount,
      employerCharges: employer,
      statusAssinatura: 'Pendente'
    };
  })(),

  // 4. Amanda Rocha (Comercial / Vendas com Comissões)
  (() => {
    const salarioBase = 4500.00;
    const comissoes = 3200.00;
    const dsrComissao = 640.00;
    const gross = salarioBase + comissoes + dsrComissao; // 8340.00
    const inssCalc = calculateINSS(gross);
    const irrfCalc = calculateIRRF(gross, inssCalc.amount, 0, 0);
    const totalDescontos = Number((inssCalc.amount + irrfCalc.amount).toFixed(2));
    const valorLiquido = Number((gross - totalDescontos).toFixed(2));
    const fgtsCalc = calculateFGTS(gross);
    const employer = calculateEmployerCharges(gross);

    return {
      id: 'stub-2026-07-004',
      periodId: 'per-2026-07',
      periodName: 'Folha Mensal - Julho / 2026',
      employeeId: 'emp-004',
      employeeName: 'Amanda Rocha',
      cpf: '456.789.012-33',
      cargo: 'Executiva de Vendas / Business Partner',
      departamento: 'Comercial',
      admissaoDate: '2025-02-01',
      salarioBase,
      diasTrabalhados: 30,
      dependentsCount: 0,
      pensaoAlimenticiaValue: 0,
      items: [
        { id: '1', code: '1001', name: 'Salário Base', type: 'Provento', reference: '30 dias', amount: salarioBase },
        { id: '2', code: '1008', name: 'Comissões de Vendas', type: 'Provento', reference: 'Metas Atingidas', amount: comissoes },
        { id: '3', code: '1007', name: 'DSR sobre Comissões', type: 'Provento', reference: 'Ref DSR', amount: dsrComissao },
        { id: '4', code: '5001', name: 'INSS', type: 'Desconto', reference: `${inssCalc.effectiveRate}%`, amount: inssCalc.amount },
        { id: '5', code: '5002', name: 'IRRF', type: 'Desconto', reference: `${irrfCalc.ratePercent}%`, amount: irrfCalc.amount }
      ],
      totalProventos: gross,
      totalDescontos,
      valorLiquido,
      baseINSS: inssCalc.base,
      valorINSS: inssCalc.amount,
      baseIRRF: irrfCalc.base,
      valorIRRF: irrfCalc.amount,
      baseFGTS: fgtsCalc.base,
      valorFGTS: fgtsCalc.amount,
      employerCharges: employer,
      statusAssinatura: 'Assinado Digitalmente',
      dataAssinatura: '2026-07-24T11:00:00Z',
      hashDigital: generateDigitalHash('stub-2026-07-004', '456.789.012-33', '2026-07-24T11:00:00Z'),
      ipAssinatura: '177.10.22.84'
    };
  })(),

  // 5. Lucas Gabriel (Técnico / Suporte - Insalubridade 20%)
  (() => {
    const salarioBase = 3200.00;
    const insalubridade = 303.60; // 20% do salário mínimo 2026 (R$ 1.518,00)
    const gross = salarioBase + insalubridade; // 3503.60
    const inssCalc = calculateINSS(gross);
    const irrfCalc = calculateIRRF(gross, inssCalc.amount, 1, 200.00); // 1 dep + pensao R$200
    const totalDescontos = Number((inssCalc.amount + irrfCalc.amount + 200.00).toFixed(2));
    const valorLiquido = Number((gross - totalDescontos).toFixed(2));
    const fgtsCalc = calculateFGTS(gross);
    const employer = calculateEmployerCharges(gross);

    return {
      id: 'stub-2026-07-005',
      periodId: 'per-2026-07',
      periodName: 'Folha Mensal - Julho / 2026',
      employeeId: 'emp-005',
      employeeName: 'Lucas Gabriel',
      cpf: '567.890.123-44',
      cargo: 'Técnico de Laboratório / Suporte',
      departamento: 'Operações e Logística',
      admissaoDate: '2025-05-12',
      salarioBase,
      diasTrabalhados: 30,
      dependentsCount: 1,
      pensaoAlimenticiaValue: 200.00,
      items: [
        { id: '1', code: '1001', name: 'Salário Base', type: 'Provento', reference: '30 dias', amount: salarioBase },
        { id: '2', code: '1005', name: 'Adicional de Insalubridade (Grau Médio 20%)', type: 'Provento', reference: '20% Sal. Mín', amount: insalubridade },
        { id: '3', code: '5001', name: 'INSS', type: 'Desconto', reference: `${inssCalc.effectiveRate}%`, amount: inssCalc.amount },
        { id: '4', code: '5002', name: 'IRRF', type: 'Desconto', reference: `${irrfCalc.ratePercent}%`, amount: irrfCalc.amount },
        { id: '5', code: '5005', name: 'Pensão Alimentícia (Judicial)', type: 'Desconto', reference: 'Acordo Judicial', amount: 200.00 }
      ],
      totalProventos: gross,
      totalDescontos,
      valorLiquido,
      baseINSS: inssCalc.base,
      valorINSS: inssCalc.amount,
      baseIRRF: irrfCalc.base,
      valorIRRF: irrfCalc.amount,
      baseFGTS: fgtsCalc.base,
      valorFGTS: fgtsCalc.amount,
      employerCharges: employer,
      statusAssinatura: 'Pendente'
    };
  })()
];

export const INITIAL_ESOCIAL_EVENTS: ESocialEvent[] = [
  {
    id: 'evt-001',
    code: 'S-1200',
    title: 'S-1200 - Remuneração de Trabalhador vinculado ao RGPS',
    description: 'Envia detalhamento de todas as rúbricas de proventos, descontos e tributos da folha mensal.',
    periodRef: '2026-07',
    totalRecords: 5,
    status: 'Validado com Sucesso',
    xmlData: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00">
  <evtRemun id="ID1123456780000002026072617300000001">
    <ideEvento>
      <indApuracao>1</indApuracao>
      <perApur>2026-07</perApur>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000190</nrInsc>
    </ideEmpregador>
    <ideTrab>
      <cpfTrab>12345678900</cpfTrab>
      <infoComplem>
        <nmTrab>Carlos Eduardo Santos</nmTrab>
        <cbos>252405</cbos>
      </infoComplem>
    </ideTrab>
  </evtRemun>
</eSocial>`,
    generatedAt: '2026-07-26T17:30:00Z',
    receiptNumber: '1.1.202607.000018294021'
  },
  {
    id: 'evt-002',
    code: 'S-1210',
    title: 'S-1210 - Pagamentos de Rendimentos do Trabalho',
    description: 'Informa as datas efetivas de pagamento e retenções de IRRF na fonte.',
    periodRef: '2026-07',
    totalRecords: 5,
    status: 'Validado com Sucesso',
    xmlData: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtPrt/v_S_01_02_00">
  <evtPrt id="ID1123456780000002026072617310000002">
    <ideEvento>
      <perApur>2026-07</perApur>
    </ideEvento>
  </evtPrt>
</eSocial>`,
    generatedAt: '2026-07-26T17:31:00Z',
    receiptNumber: '1.1.202607.000018294022'
  },
  {
    id: 'evt-003',
    code: 'S-2200',
    title: 'S-2200 - Cadastramento Inicial do Vínculo / Admissão',
    description: 'Registro oficial de admissão de trabalhadores e dados contratuais da CLT.',
    periodRef: '2026-07',
    totalRecords: 1,
    status: 'Gerado',
    xmlData: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAdm/v_S_01_02_00">
  <evtAdm id="ID1123456780000002026072617320000003">
    <vinculo>
      <tpRegTrab>1</tpRegTrab>
      <tpRegPrev>1</tpRegPrev>
    </vinculo>
  </evtAdm>
</eSocial>`,
    generatedAt: '2026-07-26T17:32:00Z'
  }
];
