import { useState, useEffect } from 'react';
import { crisisApi } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldAlert, Phone, Globe, Save, HelpCircle, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CrisisPage() {
  const [contacts, setContacts] = useState([]);
  const [plan, setPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [warningSigns, setWarningSigns] = useState('');
  const [coping, setCoping] = useState('');
  const [supportContacts, setSupportContacts] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [conRes, pRes] = await Promise.all([
        crisisApi.getContacts(),
        crisisApi.getSafetyPlan().catch(() => ({ plan: null }))
      ]);
      setContacts(conRes.contacts || []);
      
      if (pRes.plan) {
        setPlan(pRes.plan);
        setWarningSigns(pRes.plan.warning_signs || '');
        setCoping(pRes.plan.coping_strategies || '');
        setSupportContacts(JSON.stringify(pRes.plan.support_contacts_json || [], null, 2));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      let parsedContacts = [];
      try {
        parsedContacts = supportContacts ? JSON.parse(supportContacts) : [];
      } catch (e) {
        toast.error('Support contacts must be valid JSON for now (Demo Limitation)');
        return;
      }

      const payload = {
        warning_signs: warningSigns,
        coping_strategies: coping,
        support_contacts_json: parsedContacts
      };

      if (plan) {
        await crisisApi.updateSafetyPlan(payload);
      } else {
        await crisisApi.createSafetyPlan(payload);
      }
      
      toast.success('Safety plan saved');
      setIsEditing(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save safey plan');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Hero Banner */}
      <div className="bg-accent-red/10 border-2 border-accent-red/20 rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
        <div className="w-20 h-20 shrink-0 bg-accent-red rounded-full flex items-center justify-center shadow-lg shadow-accent-red/30 animate-pulse">
           <ShieldAlert size={40} className="text-white" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-display font-bold text-accent-red mb-2 tracking-tight">You are not alone.</h1>
          <p className="text-text-primary text-lg font-medium leading-relaxed max-w-2xl">
            If you are in immediate danger or experiencing a medical emergency, please call your local emergency services (e.g., 911) or go to the nearest emergency room immediately.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Global Hotlines */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-text-primary tracking-wide">Crisis Hotlines</h2>
          
          {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-bg-surface rounded-xl animate-pulse" />)}
             </div>
          ) : (
             <div className="space-y-4">
               {contacts.map(c => (
                 <Card key={c.id} className="border-border hover:border-text-muted transition-colors">
                   <CardContent className="p-5 flex items-center justify-between gap-4">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <h3 className="font-bold text-text-primary text-lg">{c.name}</h3>
                         <span className="text-xs bg-bg-surface px-2 py-0.5 rounded-md text-text-secondary font-semibold border border-border flex items-center gap-1">
                           <Globe size={12}/> {c.region}
                         </span>
                       </div>
                       <p className="text-sm text-text-muted mt-1">{c.description}</p>
                     </div>
                     
                     <a 
                       href={`tel:${c.phone_number}`}
                       className="shrink-0 w-12 h-12 bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white rounded-full flex items-center justify-center transition-colors border border-accent-red/20"
                     >
                       <Phone size={20} />
                     </a>
                   </CardContent>
                 </Card>
               ))}
               <div className="text-center text-sm text-text-muted mt-4">
                 Can't find your region? Visit <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="text-accent-blue hover:underline">findahelpline.com</a>
               </div>
             </div>
          )}
        </div>

        {/* Personal Safety Plan */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
              <HeartHandshake className="text-accent-primary" /> My Safety Plan
            </h2>
            {!isEditing && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Edit Plan</Button>
            )}
          </div>

          <Card className={`${isEditing ? 'border-accent-primary shadow-[0_0_20px_rgba(108,99,255,0.1)]' : ''}`}>
             <CardContent className="p-6 space-y-6">
               
               <div className="space-y-3">
                 <h4 className="font-semibold text-text-primary flex items-center gap-2">
                   1. Warning Signs <HelpCircle size={14} className="text-text-muted" />
                 </h4>
                 {isEditing ? (
                   <textarea
                     className="w-full h-24 bg-bg-surface border border-border rounded-lg p-3 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary focus:outline-none custom-scrollbar"
                     placeholder="Thoughts, images, feelings, or behaviors that show a crisis might be developing..."
                     value={warningSigns}
                     onChange={(e) => setWarningSigns(e.target.value)}
                   />
                 ) : (
                   <div className="bg-bg-surface p-4 rounded-xl border border-border/50 min-h-[50px] text-text-secondary text-sm whitespace-pre-wrap">
                     {warningSigns || 'No warning signs added yet.'}
                   </div>
                 )}
               </div>

               <div className="space-y-3">
                 <h4 className="font-semibold text-text-primary flex items-center gap-2">
                   2. Coping Strategies <HelpCircle size={14} className="text-text-muted" />
                 </h4>
                 {isEditing ? (
                   <textarea
                     className="w-full h-24 bg-bg-surface border border-border rounded-lg p-3 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary focus:outline-none custom-scrollbar"
                     placeholder="Things I can do by myself to take my mind off my problems..."
                     value={coping}
                     onChange={(e) => setCoping(e.target.value)}
                   />
                 ) : (
                   <div className="bg-bg-surface p-4 rounded-xl border border-border/50 min-h-[50px] text-text-secondary text-sm whitespace-pre-wrap">
                     {coping || 'No coping strategies added yet.'}
                   </div>
                 )}
               </div>

               <div className="space-y-3 hidden">
                 {/* Hiding JSON input for a cleaner demo, but data is there */}
                 <h4 className="font-semibold text-text-primary flex items-center gap-2">
                   3. People to contact
                 </h4>
                 <Input 
                   value={supportContacts}
                   onChange={e => setSupportContacts(e.target.value)}
                   disabled={!isEditing}
                 />
               </div>

               {isEditing && (
                 <div className="pt-4 border-t border-border flex justify-end gap-3">
                   <Button variant="ghost" onClick={() => { setIsEditing(false); fetchData(); }}>Cancel</Button>
                   <Button onClick={handleSavePlan} className="gap-2"><Save size={16} /> Save Safety Plan</Button>
                 </div>
               )}
             </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
