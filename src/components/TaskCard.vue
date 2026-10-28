<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  exam: string;
  date: string;
  taskNumber: string;
  title: string;
  topic: string;
  difficulty: 'łatwe' | 'średnie' | 'trudne';
  language?: 'python' | 'cpp';
  code: string;
  steps: string[];
}

const props = withDefaults(defineProps<Props>(), {
  language: 'python',
});

const expanded = ref(false);
const copied = ref(false);

const difficultyClass = computed(() => {
  switch (props.difficulty) {
    case 'łatwe': return 'text-emerald-600 border-emerald-600/30 bg-emerald-50';
    case 'średnie': return 'text-amber-600 border-amber-600/30 bg-amber-50';
    case 'trudne': return 'text-red-600 border-red-600/30 bg-red-50';
  }
});

const difficultyDots = computed(() => {
  switch (props.difficulty) {
    case 'łatwe': return 1;
    case 'średnie': return 2;
    case 'trudne': return 3;
  }
});

// Simple syntax highlighter
function highlightCode(code: string, lang: 'python' | 'cpp'): string {
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (lang === 'python') {
    result = result
      .replace(/(#.*$)/gm, '<span class="text-slate-500 italic">$1</span>')
      .replace(/\b(def|return|if|elif|else|for|while|import|from|in|not|and|or|True|False|None|print|range|len|int|str|float|input|map|split)\b/g, '<span class="text-blue-400">$1</span>')
      .replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$1</span>');
  } else {
    result = result
      .replace(/(\/\/.*$)/gm, '<span class="text-slate-500 italic">$1</span>')
      .replace(/\b(int|float|double|char|string|bool|void|return|if|else|for|while|include|using|namespace|std|cout|cin|endl|main|const|struct|class|public|private|vector)\b/g, '<span class="text-blue-400">$1</span>')
      .replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$1</span>')
      .replace(/(#\w+)/g, '<span class="text-purple-400">$1</span>');
  }
  return result;
}

const highlightedCode = highlightCode(props.code, props.language);

const codeLines = computed(() => props.code.split('\n'));

function copyCode() {
  navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

const langLabel = computed(() => props.language === 'python' ? 'Python 3.12' : 'C++17');
const fileLabel = computed(() => props.language === 'python' ? 'solution.py' : 'solution.cpp');
</script>

<template>
  <div class="border-b border-slate-200">
    <!-- Tabular row -->
    <div
      class="grid grid-cols-12 items-center gap-4 px-4 py-4 transition-colors hover:bg-slate-50/50 cursor-pointer lg:px-6"
      @click="expanded = !expanded"
    >
      <!-- Left: Exam tag (col-span-3) -->
      <div class="col-span-12 flex items-center gap-2 sm:col-span-3">
        <span class="pill pill-inf">{{ props.exam }}</span>
        <span class="pill pill-exam hidden sm:inline-flex">{{ props.date }}</span>
      </div>

      <!-- Middle: Title + topic (col-span-6) -->
      <div class="col-span-12 sm:col-span-6">
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs text-slate-400">Z.{{ props.taskNumber }}</span>
          <h3 class="text-sm font-medium text-slate-900">{{ props.title }}</h3>
        </div>
        <p class="mt-1 font-mono text-xs text-slate-500">{{ props.topic }}</p>
      </div>

      <!-- Right: Difficulty + Toggle (col-span-3) -->
      <div class="col-span-12 flex items-center justify-between gap-3 sm:col-span-3 sm:justify-end">
        <!-- Difficulty -->
        <div class="flex items-center gap-2">
          <div class="flex gap-0.5">
            <span
              v-for="i in 3"
              :key="i"
              class="h-1.5 w-4 rounded-sm"
              :class="i <= difficultyDots ? difficultyClass.split(' ')[0] : 'bg-slate-200'"
            ></span>
          </div>
          <span class="hidden font-mono text-xs font-medium lg:inline" :class="difficultyClass.split(' ')[0]">
            {{ props.difficulty }}
          </span>
        </div>

        <!-- Toggle button -->
        <button
          class="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900"
          :aria-expanded="expanded"
          @click.stop="expanded = !expanded"
        >
          {{ expanded ? 'ZAMKNIJ' : 'ROZWIŃ' }}
          <svg
            class="h-3.5 w-3.5 transition-transform duration-200"
            :class="{ 'rotate-180': expanded }"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded IDE Panel -->
    <div v-if="expanded" class="border-t border-slate-200 bg-slate-50">
      <div class="grid grid-cols-1 lg:grid-cols-2">
        <!-- Left: Code terminal -->
        <div class="border-r border-slate-200">
          <div class="terminal">
            <!-- Terminal header -->
            <div class="terminal-header">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-red-500/70"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-amber-500/70"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500/70"></span>
                <span class="ml-2 font-mono text-xs text-slate-400">{{ fileLabel }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-xs text-slate-500">{{ langLabel }}</span>
                <button
                  @click="copyCode"
                  class="flex items-center gap-1 font-mono text-xs text-slate-400 transition-colors hover:text-slate-100"
                >
                  <svg v-if="!copied" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V9.75c0 .647-.448 1.225-1.087 1.317M12.75 9.75v4.5c0 .621-.504 1.125-1.125 1.125H9.75M12.75 9.75c0-.621-.504-1.125-1.125-1.125H9.75" />
                  </svg>
                  <svg v-else class="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {{ copied ? 'SKOPIOWANO' : 'KOPIUJ' }}
                </button>
              </div>
            </div>

            <!-- Code with line numbers -->
            <div class="bg-grid-dark overflow-x-auto">
              <pre class="flex text-[13px] leading-[1.6]"><span class="flex-none select-none px-3 text-right font-mono text-slate-600">{{ codeLines.map((_, i) => i + 1).join('\n') }}</span><code class="flex-1 px-4 font-mono text-slate-100" v-html="highlightedCode"></code></pre>
            </div>
          </div>
        </div>

        <!-- Right: Math explanation panel -->
        <div class="p-5 lg:p-6">
          <div class="mb-4 flex items-center gap-2">
            <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.7 5.85c-.5.27-.7.96-.3 1.38l3.8 4.1c.2.2.2.5 0 .7l-3.8 4.1c-.4.42-.2 1.11.3 1.38l5.5 3c.5.27 1.1-.07 1.1-.65v-3.3c0-.3.3-.5.6-.4l4.2 1.6c.6.2 1.2-.4 1-1l-1.6-4.2c-.1-.3.1-.6.4-.6h3.3c.6 0 .9-.7.6-1.2l-3-5.5c-.3-.5-1-.6-1.4-.2l-4 3.8c-.2.2-.5.2-.7 0l-4.1-3.8c-.4-.4-1.1-.2-1.4.3Z" />
            </svg>
            <h4 class="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">Rozwiązanie krok po kroku</h4>
          </div>

          <ol class="space-y-5">
            <li v-for="(step, index) in props.steps" :key="index" class="flex gap-4">
              <span class="flex h-7 w-7 flex-none items-center justify-center border border-slate-900 font-mono text-xs font-semibold text-slate-900">
                {{ index + 1 }}
              </span>
              <div class="pt-0.5">
                <p class="text-sm leading-relaxed text-slate-700" v-html="step"></p>
              </div>
            </li>
          </ol>

          <!-- Result badge -->
          <div class="mt-6 border-t border-slate-200 pt-4">
            <div class="flex items-center gap-2 font-mono text-xs">
              <span class="text-slate-500">Wynik:</span>
              <span class="inline-flex items-center gap-1.5 border border-emerald-600/30 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                ZALICZONE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
