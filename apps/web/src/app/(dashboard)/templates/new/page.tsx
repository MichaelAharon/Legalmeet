'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Sparkles, PenLine, Copy, Check,
  ChevronRight, AlertCircle, Loader2,
} from 'lucide-react';
import {
  Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent, Badge, Separator,
} from '@legalmeet/ui';
import { useNDATemplates, useCreateNDATemplate, useGenerateNDA } from '@/hooks/useNDA';
import { cn } from '@/lib/utils/cn';

// --- Tab 1: Start from an existing template ---

function FromTemplateTab({ onUseTemplate }: { onUseTemplate: (name: string, content: string) => void }) {
  const { data: templates, isLoading } = useNDATemplates();

  const categoryColors: Record<string, string> = {
    general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    employment: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    investment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    technology: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    mergers: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    vendor: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  };

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Choose a pre-built NDA template and customize it for your needs.</p>
      <div className="grid gap-3">
        {(templates || []).map((t: any) => (
          <Card
            key={t.id}
            className="group hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
            onClick={() => onUseTemplate(t.name, t.content)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    {t.isDefault && <Badge variant="default" className="text-[10px]">Default</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 ml-6">{t.description || `${t.templateVars?.length || 0} template variables`}</p>
                  <div className="flex items-center gap-2 mt-2 ml-6">
                    <Badge className={cn('text-[10px]', categoryColors[t.category] || categoryColors.general)}>
                      {t.category || 'general'}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{t.templateVars?.length || 0} variables</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- Tab 2: Write custom NDA ---

function WriteCustomTab({ name, content, onNameChange, onContentChange }: {
  name: string;
  content: string;
  onNameChange: (v: string) => void;
  onContentChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Write your own NDA from scratch. Use {'{{variable_name}}'} for dynamic fields that can be filled in later.</p>
      <Input
        label="Template Name"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        placeholder="e.g., My Custom Partnership NDA"
        required
      />
      <Textarea
        label="NDA Content"
        value={content}
        onChange={e => onContentChange(e.target.value)}
        placeholder={`NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement is entered into as of {{effective_date}} by and between:\n\n{{party_a}} ("First Party") and {{party_b}} ("Second Party").\n\n1. CONFIDENTIAL INFORMATION\n...\n\nWrite your full NDA content here. Use {{variable}} syntax for dynamic fields.`}
        rows={20}
        className="font-mono text-sm"
        required
      />
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Tip: Use double curly braces for variables: {'{{party_a}}'}, {'{{effective_date}}'}, {'{{jurisdiction}}'}, etc.</span>
      </div>
    </div>
  );
}

// --- Tab 3: Generate from description ---

function GenerateTab({ onGenerated }: { onGenerated: (name: string, content: string) => void }) {
  const [description, setDescription] = useState('');
  const [generated, setGenerated] = useState<any>(null);
  const generateNDA = useGenerateNDA();

  const handleGenerate = async () => {
    try {
      const result = await generateNDA.mutateAsync({ description });
      setGenerated(result);
    } catch (err: any) {
      // error handled via mutation state
    }
  };

  const handleUseGenerated = () => {
    if (generated) {
      onGenerated(generated.name, generated.content);
    }
  };

  const examplePrompts = [
    'NDA between our startup and a VC firm for Series A fundraising, governed by Delaware law, 3 years duration with GDPR compliance',
    'Employee NDA for a senior software developer joining our AI company, with non-compete and IP assignment clauses',
    'Mutual NDA between two tech companies exploring an API integration partnership, with data protection and arbitration',
    'Vendor NDA for a marketing agency that will access our customer database, California jurisdiction',
    'M&A NDA for due diligence with a potential acquirer, including standstill and non-solicitation of employees',
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Describe what you need in plain language and we'll generate a professional NDA for you.
      </p>

      <Textarea
        label="Describe your NDA"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Example: I need an NDA between my company and a freelance developer for a 6-month software project. Include IP assignment, non-compete, and data protection clauses. Governed by New York law."
        rows={5}
        required
      />

      {/* Example prompts */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Try an example:</p>
        <div className="flex flex-wrap gap-1.5">
          {examplePrompts.map((prompt, i) => (
            <button
              key={i}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900 dark:hover:text-indigo-300 transition-colors text-left"
              onClick={() => setDescription(prompt)}
            >
              {prompt.slice(0, 60)}...
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={description.trim().length < 10 || generateNDA.isPending}
        className="w-full"
      >
        {generateNDA.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating NDA...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate NDA
          </>
        )}
      </Button>

      {generateNDA.isError && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
          {generateNDA.error?.message || 'Failed to generate NDA. Please try again.'}
        </div>
      )}

      {/* Generated result preview */}
      {generated && (
        <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Generated: {generated.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {generated.detectedCategory}
                </Badge>
                {generated.detectedElements?.specialClauses?.map((c: string) => (
                  <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 max-h-[400px] overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {generated.content}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUseGenerated} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Use This NDA
            </Button>
            <Button variant="outline" onClick={handleGenerate} disabled={generateNDA.isPending}>
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---

export default function NewTemplatePage() {
  const router = useRouter();
  const createTemplate = useCreateNDATemplate();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const [showEditor, setShowEditor] = useState(false);

  const handleUseTemplate = (templateName: string, templateContent: string) => {
    setName(`${templateName} (Copy)`);
    setContent(templateContent);
    setShowEditor(true);
    setActiveTab('custom');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-detect template vars from {{var}} patterns
    const varMatches = content.match(/\{\{(\w+)\}\}/g) || [];
    const uniqueVars = [...new Set(varMatches.map(v => v.replace(/\{\{|\}\}/g, '')))];
    const templateVars = uniqueVars.map(v => ({
      name: v,
      label: v.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      type: v.includes('date') ? 'date' : 'text',
      required: true,
    }));

    await createTemplate.mutateAsync({ name, content, templateVars });
    router.push('/templates');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/templates"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create NDA Document</h1>
          <p className="text-sm text-slate-500">Choose a template, write your own, or generate from a description</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="templates" className="flex-1 text-sm">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                From Template
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 text-sm">
                <PenLine className="h-3.5 w-3.5 mr-1.5" />
                Write Custom
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex-1 text-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate from Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <FromTemplateTab onUseTemplate={handleUseTemplate} />
            </TabsContent>

            <TabsContent value="custom">
              <form onSubmit={handleSubmit} className="space-y-4">
                <WriteCustomTab
                  name={name}
                  content={content}
                  onNameChange={setName}
                  onContentChange={setContent}
                />

                {/* Preview detected variables */}
                {content && (() => {
                  const vars = [...new Set((content.match(/\{\{(\w+)\}\}/g) || []).map(v => v.replace(/\{\{|\}\}/g, '')))];
                  if (vars.length === 0) return null;
                  return (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-500 mb-2">Detected Variables ({vars.length}):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {vars.map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] font-mono">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <Separator />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/templates">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={createTemplate.isPending || !name || !content}>
                    {createTemplate.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>
                    ) : (
                      'Save Template'
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="generate">
              <GenerateTab onGenerated={handleUseTemplate} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
