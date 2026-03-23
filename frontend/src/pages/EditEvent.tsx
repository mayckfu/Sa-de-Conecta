import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventoSchema, type EventoFormData } from '../schemas/eventoSchema';
import { useAuth } from '../hooks/useAuth';
import { useEventos } from '../hooks/useEventos';
import { useToast } from '../hooks/useToast';
import { supabase } from '../services/supabase';
import { 
  Save, 
  Coffee, 
  Package, 
  FileText, 
  Info,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  Hash,
  Trash2,
  File,
  Paperclip,
  FileUp
} from 'lucide-react';
import { cn } from '../utils/cn';
import { coffeeItems, materiaisItems } from '../constants/eventForms';

type FormStep = 'info' | 'logistica' | 'materiais' | 'documentos';

export const EditEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { refreshEvents } = useEventos();
  const { showToast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (profile && profile.role === 'visitante') {
      navigate('/gestao/eventos');
    }
  }, [profile, navigate]);
  const [activeStep, setActiveStep] = useState<FormStep>('info');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<EventoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventoSchema) as any,
    defaultValues: {
      nome: '',
      data: new Date().toISOString().split('T')[0],
      hora: '08:00',
      horaFim: '18:00',
      local: '',
      unidade: '',
      tipo: 'reunião',
      responsavel: '',      participantes: 1,
      situacao: 'planejado',
      temCoffee: false,
      coffee: { cafe: false, agua: false, suco: false, bolo: false, salgados: false, frutas: false, biscoitos: false, obs: '' },
      detalhesCoffee: {},
      materiais: { projetor: false, microfone: false, caixa_som: false, banner: false, tenda: false, mesas: false, cadeiras: false, notebook: false, logistica: false, cafe: false, descartaveis_gerais: false },
      detalhesMateriais: {}
    }
  });

  const temCoffeeWatch = watch('temCoffee');
  const coffeeWatch = watch('coffee') || {};
  const materiaisWatch = watch('materiais') || {};

  useEffect(() => {
    const fetchEvento = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          logistica (*),
          materiais (*)
        `)
        .eq('id', id)
        .single();

      if (data) {
        const log = data.logistica
          ? Array.isArray(data.logistica) ? data.logistica[0] : data.logistica
          : null;
        const mat = data.materiais
          ? Array.isArray(data.materiais) ? data.materiais[0] : data.materiais
          : null;

        reset({
          nome: data.nome || '',
          data: data.data || '',
          hora: data.hora_inicio || '',
          horaFim: data.hora_fim || '',
          local: data.local || '',
          unidade: data.unidade_responsavel || '',
          tipo: data.tipo || 'reunião',
          responsavel: data.responsavel || '',
          participantes: data.participantes_previstos || 1,
          situacao: data.situacao || 'planejado',
          temCoffee: log?.tem_coffee_break || false,
          coffee: {
            cafe: log?.cafe || false,
            agua: log?.agua || false,
            suco: log?.suco || false,
            bolo: log?.bolo || false,
            salgados: log?.salgados || false,
            frutas: log?.frutas || false,
            biscoitos: log?.biscoitos || false,
            obs: log?.observacoes || ''
          },
          materiais: {
            projetor: mat?.projetor || false,
            microfone: mat?.microfone || false,
            caixa_som: mat?.caixa_som || false,
            banner: mat?.banner || false,
            tenda: mat?.tenda || false,
            mesas: mat?.mesas || false,
            cadeiras: mat?.cadeiras || false,
            notebook: mat?.notebook || false,
            logistica: mat?.logistica || false,
            cafe: mat?.cafe || false,
            descartaveis_gerais: mat?.descartaveis_gerais || false
          },
          detalhesCoffee: log?.detalhes || {},
          detalhesMateriais: mat?.detalhes || {}
        });
      }
      setInitialLoading(false);
      if (error) console.error('Error fetching event for edit:', error);
    };

    fetchEvento();
  }, [id, reset]);

  const steps: { id: FormStep; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Informações Básicas', icon: Info },
    { id: 'logistica', label: 'Logística & Coffee', icon: Coffee },
    { id: 'materiais', label: 'Materiais', icon: Package },
    { id: 'documentos', label: 'Documentação', icon: FileText },
  ];

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (currentIndex < steps.length - 1) setActiveStep(steps[currentIndex + 1].id);
  };

  const handlePrev = () => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) setActiveStep(steps[currentIndex - 1].id);
  };

  const onSubmit = async (data: EventoFormData) => {
    try {
      if (!id) throw new Error("ID do evento não fornecido.");
      setIsUploading(true);
      console.log('Iniciando atualização de evento:', id);

      // 1. Atualizar Evento
      const { error: eventError } = await supabase
        .from('eventos')
        .update({
          nome: data.nome,
          data: data.data || new Date().toISOString().split('T')[0],
          hora_inicio: data.hora || '08:00',
          hora_fim: data.horaFim || '18:00',
          local: data.local,
          unidade_responsavel: data.unidade,
          tipo: data.tipo,
          responsavel: data.responsavel,
          participantes_previstos: Number(data.participantes),
          situacao: data.situacao,
          observacoes: ''
        })
        .eq('id', id);

      if (eventError) throw new Error(`Evento: ${eventError.message}`);

      // 2. Atualizar Logística
      const { error: logisticaError } = await supabase
        .from('logistica')
        .upsert({
          evento_id: id,
          tem_coffee_break: data.temCoffee,
          quantidade_pessoas: Number(data.participantes),
          cafe: data.coffee.cafe,
          agua: data.coffee.agua,
          suco: data.coffee.suco,
          bolo: data.coffee.bolo,
          salgados: data.coffee.salgados,
          frutas: data.coffee.frutas,
          biscoitos: data.coffee.biscoitos,
          observacoes: data.coffee.obs,
          detalhes: data.detalhesCoffee
        }, { onConflict: 'evento_id' });

      if (logisticaError) throw new Error(`Logística: ${logisticaError.message}`);

      // 3. Atualizar Materiais
      const { error: materiaisError } = await supabase
        .from('materiais')
        .upsert({
          evento_id: id,
          projetor: data.materiais.projetor,
          microfone: data.materiais.microfone,
          caixa_som: data.materiais.caixa_som,
          banner: data.materiais.banner,
          tenda: data.materiais.tenda,
          mesas: data.materiais.mesas,
          cadeiras: data.materiais.cadeiras,
          notebook: data.materiais.notebook,
          logistica: data.materiais.logistica,
          cafe: data.materiais.cafe,
          descartaveis_gerais: data.materiais.descartaveis_gerais,
          detalhes: data.detalhesMateriais
        }, { onConflict: 'evento_id' });

      if (materiaisError) throw new Error(`Materiais: ${materiaisError.message}`);

      // 4. Upload de Documento (se houver)
      if (selectedFile) {
        console.log('Iniciando upload para o Google Drive:', selectedFile.name);
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('evento_id', id);

        try {
          const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-to-drive', {
            body: uploadFormData,
          });

          if (uploadError) throw new Error(`Upload: ${uploadError.message}`);
          if (uploadData?.error) throw new Error(`Drive: ${uploadData.error}`);
          console.log('Upload concluído com sucesso');
        } catch (errorFunc: unknown) {
          console.error('Erro na função de upload:', errorFunc);
          throw errorFunc;
        }
      }

      await supabase.from('logs_eventos').insert([{
        evento_id: id,
        acao: 'edicao',
        detalhes: 'Detalhes do evento foram atualizados na plataforma'
      }]);

      await refreshEvents();
      showToast('Alterações salvas com sucesso!', 'success');
      navigate('/gestao/eventos');
    } catch (error: unknown) {
      console.error('Erro ao salvar edições:', error);
      // @ts-expect-error - error is unknown
      showToast(error?.message || 'Erro ao salvar as edições.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const onValidationError = (errors: Record<string, unknown>) => {
    console.log('Erros de validação na edição:', errors);
    const firstErrorField = Object.keys(errors)[0];
    
    const fieldStepMap: Record<string, FormStep> = {
      nome: 'info', data: 'info', hora: 'info', horaFim: 'info', local: 'info', unidade: 'info', responsavel: 'info', participantes: 'info',
      temCoffee: 'logistica', coffee: 'logistica',
      materiais: 'materiais'
    };

    const targetStep = fieldStepMap[firstErrorField] || 'info';
    if (targetStep !== activeStep) {
      setActiveStep(targetStep);
      showToast(`Por favor, corrija os erros no passo: ${steps.find(s => s.id === targetStep)?.label}`, 'error');
    } else {
      showToast('Por favor, preencha todos os campos obrigatórios marcados em vermelho.', 'error');
    }
  };

  const handleCancel = () => {
    if (confirm('Tem certeza que deseja cancelar? Os dados preenchidos serão perdidos.')) {
      navigate('/gestao/eventos');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Edição</p>
          <h2 className="font-display text-3xl font-bold text-arc-dark tracking-tight">Editar Evento</h2>
          <p className="text-sm text-slate-400 mt-0.5">Altere os dados do evento na rede municipal.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCancel}
            className="px-5 py-2 text-slate-400 text-sm font-medium hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit(onSubmit, onValidationError)}
            disabled={initialLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-glow-purple hover:-translate-y-0.5 transition-all duration-200"
          >
            <Save className="w-4 h-4" /> Salvar Edição
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        </div>
      ) : (
      <div className="glass-card rounded-2xl overflow-hidden flex min-h-[600px]">
        {/* Progress Sidebar */}
        <div className="w-64 bg-white/30 border-r border-white/50 p-5 space-y-2">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left",
                activeStep === step.id 
                  ? "bg-white/80 shadow-glass-sm border border-white/70 text-arc-dark" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 shrink-0",
                activeStep === step.id
                  ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-glow-purple"
                  : idx < steps.findIndex(s => s.id === activeStep)
                    ? "bg-emerald-500 text-white"
                    : "bg-white/60 text-slate-400"
              )}>
                {idx < steps.findIndex(s => s.id === activeStep)
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : idx + 1
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{step.label}</p>
                {activeStep === step.id && <p className="text-[9px] text-violet-400 mt-0.5 font-medium">Preenchendo...</p>}
              </div>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex-1 space-y-6">
            {activeStep === 'info' && (
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Nome do Evento</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Capacitação do PNI 2026" 
                    {...register('nome')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium placeholder-slate-300 text-arc-dark shadow-sm",
                      errors.nome ? "border-red-400 focus:ring-red-400/10 focus:border-red-500" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.nome && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.nome.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet-400" /> Data</label>
                  <input 
                    type="date" 
                    {...register('data')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium text-arc-dark shadow-sm",
                      errors.data ? "border-red-400 focus:ring-red-400/10" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.data && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.data.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-violet-400" /> Hora de Início</label>
                  <input 
                    type="time" 
                    {...register('hora')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium text-arc-dark shadow-sm",
                      errors.hora ? "border-red-400 focus:ring-red-400/10" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.hora && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.hora.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-violet-400" /> Hora de Término</label>
                  <input 
                    type="time" 
                    {...register('horaFim')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium text-arc-dark shadow-sm",
                      errors.horaFim ? "border-red-400 focus:ring-red-400/10" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.horaFim && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.horaFim.message}</p>}
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-violet-400" /> Local</label>
                  <input 
                    type="text" 
                    placeholder="Auditório, Praça, Unidade X..." 
                    {...register('local')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium placeholder-slate-300 text-arc-dark shadow-sm",
                      errors.local ? "border-red-400 focus:ring-red-400/10" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.local && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.local.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-violet-400" /> Unidade Responsável</label>
                  <input 
                    type="text" 
                    placeholder="Digite a unidade (ex: Vigilância Sanitária)" 
                    {...register('unidade')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium placeholder-slate-300 text-arc-dark shadow-sm",
                      errors.unidade ? "border-red-400 focus:ring-red-400/10" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.unidade && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.unidade.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-violet-400" /> Responsável</label>
                  <input 
                    type="text" 
                    {...register('responsavel')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium text-arc-dark shadow-sm",
                      errors.responsavel ? "border-red-400 focus:ring-red-400/10" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.responsavel && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.responsavel.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-violet-400" /> Participantes</label>
                  <input 
                    type="number" 
                    {...register('participantes')}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl focus:ring-4 outline-none transition-all duration-200 text-sm font-medium text-arc-dark shadow-sm",
                      errors.participantes ? "border-red-400 focus:ring-red-400/10" : "border-slate-200 focus:ring-violet-400/10 focus:border-violet-400"
                    )}
                  />
                  {errors.participantes && <p className="text-red-500 text-[11px] font-semibold mt-1 ml-1">{errors.participantes.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> Situação</label>
                  <select 
                    {...register('situacao')}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-400/10 focus:border-violet-400 outline-none transition-all duration-200 text-sm font-medium text-arc-dark shadow-sm"
                  >
                    <option value="planejado">Planejado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            )}

            {activeStep === 'logistica' && (
              <div className="space-y-6">
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.25)]">
                       <Coffee className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-arc-dark">Coffee Break</h4>
                      <p className="text-xs text-slate-400 font-medium">O evento terá serviço de alimentação?</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('temCoffee')} className="sr-only peer" />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-indigo-500"></div>
                  </label>
                </div>

                {temCoffeeWatch && (
                  <div className="space-y-6 animate-in slide-in-from-top duration-300">
                    <div className="p-1 px-1 bg-violet-50/50 rounded-2xl border border-violet-100/50">
                      <div className="space-y-2 p-5">
                        <label className="text-xs font-bold text-violet-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Hash className="w-4 h-4" /> Quantidade Total de Pessoas
                        </label>
                        <input 
                          type="number" 
                          placeholder="Ex: 50"
                          {...register('participantes')}
                          className="w-full px-6 py-4 bg-white border-2 border-violet-200 rounded-2xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-xl font-bold text-arc-dark shadow-sm" 
                        />
                        <p className="text-[10px] text-slate-400 ml-2 font-medium">Este número será usado para calcular as porções do coffee break.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Itens Solicitados</label>
                      <div className="grid grid-cols-2 gap-3">
                        {coffeeItems.map(item => {
                          const isSelected = coffeeWatch[item.id as keyof typeof coffeeWatch];
                          return (
                            <div key={item.id} className={cn(
                              "relative group transition-all duration-300",
                              isSelected ? "col-span-2" : "col-span-1"
                            )}>
                              <label className={cn(
                                "flex items-center justify-between p-4 bg-white/60 border border-white/70 rounded-xl hover:bg-white/80 hover:border-violet-200/60 cursor-pointer transition-all duration-300",
                                isSelected && "bg-white border-violet-300 shadow-glass-sm ring-1 ring-violet-200/50"
                              )}>
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                    isSelected ? item.bg : "bg-violet-50/50 group-hover:bg-violet-100",
                                    isSelected ? item.color : "text-violet-400 group-hover:text-violet-600"
                                  )}>
                                    <item.icon className="w-4 h-4" />
                                  </div>
                                  <span className={cn(
                                    "text-xs font-semibold transition-colors duration-200",
                                    isSelected ? "text-arc-dark" : "text-slate-600 group-hover:text-violet-600"
                                  )}>
                                    {item.name}
                                  </span>
                                </div>
                                <input 
                                  type="checkbox" 
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  {...register(`coffee.${item.id}` as any)}
                                  className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400/30" 
                                />
                              </label>
                              
                              {isSelected && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <input 
                                    type="text" 
                                    placeholder={`Descreva a quantidade (ex: 2 pacotes, 4L...)`}
                                    {...register(`detalhesCoffee.${item.id}`)}
                                    className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-xs font-semibold text-arc-dark shadow-sm transition-all duration-200"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeStep === 'materiais' && (
              <div className="space-y-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Equipamentos e Materiais</label>
                <div className="grid grid-cols-2 gap-3">
                  {materiaisItems.map(item => {
                    const isSelected = materiaisWatch[item.id as keyof typeof materiaisWatch];
                    return (
                      <div key={item.id} className={cn(
                        "relative group transition-all duration-300",
                        isSelected ? "col-span-2" : "col-span-1"
                      )}>
                        <label className={cn(
                          "flex items-center justify-between p-4 bg-white/60 border border-white/70 rounded-xl hover:bg-white/80 hover:border-violet-200/60 cursor-pointer transition-all duration-300",
                          isSelected && "bg-white border-violet-300 shadow-glass-sm ring-1 ring-violet-200/50"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                              isSelected ? item.bg : "bg-violet-50/50 group-hover:bg-violet-100",
                              isSelected ? item.color : "text-violet-400 group-hover:text-violet-600"
                            )}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className={cn(
                              "text-xs font-semibold transition-colors duration-200",
                              isSelected ? "text-arc-dark" : "text-slate-600 group-hover:text-violet-600"
                            )}>
                              {item.name}
                            </span>
                          </div>
                          <input 
                            type="checkbox" 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            {...register(`materiais.${item.id}` as any)}
                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400/30" 
                          />
                        </label>
                        
                        {isSelected && (
                          <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <input 
                              type="text" 
                              placeholder={`Especificação/Quantidade (ex: 2 unidades, HDMI...)`}
                              {...register(`detalhesMateriais.${item.id}`)}
                              className="w-full px-4 py-3 bg-white border border-violet-200 rounded-xl outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-xs font-semibold text-arc-dark shadow-sm transition-all duration-200"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeStep === 'documentos' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-arc-dark uppercase tracking-wider">Documentação do Evento</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Anexe arquivos para controle e registro</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-violet-400" /> Anexar Novos Arquivos
                  </label>
                  
                  {/* Upload Area */}
                  <div className="relative group">
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-white/40 group-hover:bg-white/80 group-hover:border-violet-300 transition-all duration-300 cursor-pointer">
                      <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FileUp className="w-8 h-8 text-violet-500" />
                      </div>
                      <h4 className="text-sm font-bold text-arc-dark mb-1">
                        {selectedFile ? selectedFile.name : 'Arraste seus arquivos aqui'}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mb-6">
                        {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'ou clique para selecionar do seu computador'}
                      </p>
                      
                      <input 
                        type="file" 
                        id="document-upload" 
                        className="hidden" 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      
                      <div className="flex gap-2">
                        <label 
                          htmlFor="document-upload" 
                          className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-pointer"
                        >
                          {selectedFile ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                        </label>
                        {selectedFile && (
                          <button 
                            onClick={() => setSelectedFile(null)}
                            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center font-medium">Arquivos aceitos: PDF, DOCX, JPG, PNG (Max 10MB por arquivo)</p>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Documentos em Anexo</label>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* Simulated Document List */}
                    {[
                      { name: 'Oficio_Solicitacao_Auditório.pdf', type: 'PDF', size: '1.2 MB' },
                      { name: 'Convite_PNI_2026.png', type: 'IMG', size: '450 KB' }
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-violet-200 transition-all group animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                          <File className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-arc-dark truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.type} • {doc.size}</p>
                        </div>
                        <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/50 mt-6">
            <button 
              onClick={handlePrev}
              disabled={activeStep === 'info'}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 text-sm font-medium hover:text-slate-600 disabled:opacity-30 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            {activeStep === 'documentos' ? (
              <button 
                onClick={handleSubmit(onSubmit, onValidationError)}
                disabled={isUploading}
                className={cn(
                  "px-8 py-3 bg-violet-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95 flex items-center gap-2",
                  isUploading && "opacity-70 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Finalizar Agendamento
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="px-8 py-3 bg-violet-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95 flex items-center gap-2"
              >
                Próximo Passo <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
