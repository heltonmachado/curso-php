const lessons = [
    {
        badge: 'APOSTILA 01 • PDF TÉCNICO',
        title: 'Domain-Driven Design (DDD) Pragmático e Pattern Action no Laravel',
        fileName: 'apostila-01-ddd-laravel.pdf',
        customPdfPath: '',
        fullText: `Módulo 1: Domain-Driven Design Pragmático e Pattern Action no Laravel. Em aplicações corporativas de grande porte, concentrar regras de negócio dentro de Controllers ou Models gera código difícil de testar e manter. Nesta apostila, estruturamos o sistema em domínios claros, utilizando Data Transfer Objects (DTOs) imutáveis com classes readonly do PHP 8.4 para transportar dados com tipagem estrita. Em seguida, isolamos cada caso de uso em uma classe Action única com o método execute, garantindo o princípio da responsabilidade única do SOLID, transações atômicas no banco de dados e facilidade para escrever testes unitários e de arquitetura com Pest PHP.`
    },
    {
        badge: 'APOSTILA 02 • PDF TÉCNICO',
        title: 'PostgreSQL Indexes, Laravel Octane & Filas Distribuídas',
        fileName: 'apostila-02-performance-filas.pdf',
        customPdfPath: '',
        fullText: `Módulo 2: Alta Performance com PostgreSQL, Laravel Octane e Filas Distribuídas. Para escalar sistemas que recebem milhares de requisições simultâneas, começamos diagnosticando gargalos no banco de dados com EXPLAIN ANALYZE, criando índices compostos, parciais e eliminando consultas N+1. Na camada de aplicação, substituímos o ciclo tradicional do PHP-FPM pelo Laravel Octane rodando sobre FrankenPHP, mantendo o framework carregado em memória. Para tarefas pesadas como emissão de notas, envio de e-mails e webhooks, implementamos filas assíncronas resilientes com Redis, Laravel Horizon e RabbitMQ com políticas de retentativa e dead-letter queues.`
    },
    {
        badge: 'APOSTILA 03 • PDF TÉCNICO',
        title: 'Fullstack Moderno com Inertia.js, Vue 3, TypeScript & Reverb',
        fileName: 'apostila-03-fullstack-realtime.pdf',
        customPdfPath: '',
        fullText: `Módulo 3: Desenvolvimento Fullstack Moderno com Inertia.js, Vue 3, TypeScript e Laravel Reverb. O Inertia.js permite construir aplicações Single Page Application reativas mantendo o roteamento, autenticação e autorização do Laravel sem a necessidade de manter duas APIs separadas. Utilizamos Vue 3 com Composition API e TypeScript para garantir segurança de tipos entre os dados enviados pelo backend e os componentes de interface estilizados com Tailwind CSS. Para recursos colaborativos em tempo real, configuramos o servidor WebSocket nativo Laravel Reverb, transmitindo eventos instantâneos em canais privados.`
    },
    {
        badge: 'APOSTILA 04 • PDF TÉCNICO',
        title: 'Docker Multi-Stage, GitHub Actions & Deploy Zero-Downtime',
        fileName: 'apostila-04-devops-cicd.pdf',
        customPdfPath: '',
        fullText: `Módulo 4: Infraestrutura, Docker Multi-Stage e Deploy Zero-Downtime. Um engenheiro fullstack sênior domina o ciclo completo até a produção. Nesta apostila construímos imagens Docker enxutas e seguras utilizando builds multi-stage com PHP 8.4 Alpine, separando dependências de desenvolvimento das de produção. Configuramos pipelines automatizadas no GitHub Actions para rodar análise estática com PHPStan nível 9, formatação com Pint e a suíte de testes Pest PHP a cada Pull Request, finalizando com deploy contínuo sem interrupção para os usuários.`
    }
];

let currentLessonIndex = 0;
let completedLessons = JSON.parse(localStorage.getItem('zedo_completed_lessons') || '[]');

function buildDynamicPdfBlobUrl(lesson) {
    const sanitize = (str) => str
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x20-\x7E]/g, ' ')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

    const titleClean = sanitize(lesson.title);
    const badgeClean = sanitize(lesson.badge);
    const words = sanitize(lesson.fullText).split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach(w => {
        if ((currentLine + ' ' + w).length > 78) {
            lines.push(currentLine.trim());
            currentLine = w;
        } else {
            currentLine += ' ' + w;
        }
    });
    if (currentLine.trim()) lines.push(currentLine.trim());

    let textOps = `BT\n/F2 11 Tf\n50 770 Td\n(ZEDODEV OPEN - FORMACAO FULLSTACK SENIOR PHP & LARAVEL) Tj\n`;
    textOps += `/F1 10 Tf\n0 -18 Td\n(${badgeClean}) Tj\n`;
    textOps += `/F2 15 Tf\n0 -28 Td\n(${titleClean}) Tj\n`;
    textOps += `/F1 11 Tf\n0 -30 Td\n`;

    lines.forEach(line => {
        textOps += `(${line}) Tj\n0 -18 Td\n`;
    });

    textOps += `0 -25 Td\n/F2 10 Tf\n(Licenca MIT / Creative Commons - Material Gratuito e Acessivel) Tj\nET`;

    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj',
        `4 0 obj\n<< /Length ${textOps.length} >>\nstream\n${textOps}\nendstream\nendobj`,
        '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
        '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj'
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach(obj => {
        offsets.push(pdf.length);
        pdf += obj + '\n';
    });

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
        pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    const blob = new Blob([pdf], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
}

function selectLesson(index) {
    stopSpeech();
    currentLessonIndex = index;
    const lesson = lessons[index];

    document.getElementById('lesson-badge').innerText = lesson.badge;
    document.getElementById('lesson-title').innerText = lesson.title;
    document.getElementById('lesson-desc').innerText = lesson.fullText;

    const pdfUrl = lesson.customPdfPath ? lesson.customPdfPath : buildDynamicPdfBlobUrl(lesson);
    document.getElementById('lesson-pdf-viewer').src = pdfUrl;

    const downloadBtn = document.getElementById('btn-download-pdf');
    downloadBtn.href = pdfUrl;
    downloadBtn.download = lesson.fileName;

    lessons.forEach((_, i) => {
        const btn = document.getElementById(`lesson-btn-${i}`);
        if (i === index) {
            btn.classList.add('bg-zinc-900', 'border-brand-red/50');
            btn.classList.remove('border-transparent');
        } else {
            btn.classList.remove('bg-zinc-900', 'border-brand-red/50');
            btn.classList.add('border-transparent');
        }
    });
    updateLessonUI();
}

function toggleCurrentLesson() {
    if (completedLessons.includes(currentLessonIndex)) {
        completedLessons = completedLessons.filter(i => i !== currentLessonIndex);
    } else {
        completedLessons.push(currentLessonIndex);
    }
    localStorage.setItem('zedo_completed_lessons', JSON.stringify(completedLessons));
    updateLessonUI();
}

function updateLessonUI() {
    const isCompleted = completedLessons.includes(currentLessonIndex);
    const btn = document.getElementById('btn-complete-lesson');
    if (isCompleted) {
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Concluída';
        btn.classList.replace('bg-emerald-600', 'bg-zinc-700');
    } else {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Concluir';
        btn.classList.replace('bg-zinc-700', 'bg-emerald-600');
    }

    lessons.forEach((_, i) => {
        const icon = document.getElementById(`check-icon-${i}`);
        if (completedLessons.includes(i)) {
            icon.className = 'fa-solid fa-circle-check text-emerald-400 mt-1';
        } else {
            icon.className = 'fa-regular fa-circle text-zinc-500 mt-1';
        }
    });

    const pct = Math.round((completedLessons.length / lessons.length) * 100);
    document.getElementById('progress-text').innerText = `${pct}% (${completedLessons.length}/${lessons.length})`;
    document.getElementById('progress-bar').style.width = `${pct}%`;
}

let currentUtterance = null;
let isPaused = false;

function speakLesson() {
    if (!('speechSynthesis' in window)) {
        alert('Seu navegador não suporta leitura por voz nativa.');
        return;
    }

    window.speechSynthesis.cancel();
    isPaused = false;
    updatePauseButtonUI();

    const lesson = lessons[currentLessonIndex];
    const textToRead = `${lesson.title}. ${lesson.fullText}`;

    currentUtterance = new SpeechSynthesisUtterance(textToRead);
    currentUtterance.lang = 'pt-BR';
    currentUtterance.rate = parseFloat(document.getElementById('voice-rate').value) || 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt'));
    if (ptVoice) currentUtterance.voice = ptVoice;

    currentUtterance.onstart = () => {
        document.getElementById('voice-status').innerText = `Narrando: "${lesson.title}"...`;
        document.getElementById('voice-status').classList.add('text-emerald-400');
    };

    currentUtterance.onend = () => {
        document.getElementById('voice-status').innerText = 'Leitura da apostila concluída.';
        document.getElementById('voice-status').classList.remove('text-emerald-400');
        isPaused = false;
        updatePauseButtonUI();
    };

    window.speechSynthesis.speak(currentUtterance);
}

function pauseResumeSpeech() {
    if (!window.speechSynthesis.speaking) return;

    if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        document.getElementById('voice-status').innerText = 'Leitura retomada...';
    } else {
        window.speechSynthesis.pause();
        isPaused = true;
        document.getElementById('voice-status').innerText = 'Leitura pausada.';
    }
    updatePauseButtonUI();
}

function stopSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    isPaused = false;
    updatePauseButtonUI();
    const statusEl = document.getElementById('voice-status');
    if (statusEl) {
        statusEl.innerText = 'Pronto para narrar o conteúdo da apostila selecionada.';
        statusEl.classList.remove('text-emerald-400');
    }
}

function updatePauseButtonUI() {
    const btn = document.getElementById('btn-pause-voice');
    if (!btn) return;
    btn.innerHTML = isPaused
        ? '<i class="fa-solid fa-play"></i> Retomar'
        : '<i class="fa-solid fa-pause"></i> Pausar';
}

function updateVoiceRate() {
    if (window.speechSynthesis.speaking) {
        speakLesson();
    }
}

const availableSkills = [
    'PHP 8.4', 'Laravel 12', 'DDD', 'SOLID', 'Pest PHP', 'PHPStan L9',
    'PostgreSQL', 'Redis', 'Laravel Octane', 'RabbitMQ', 'Vue 3',
    'Inertia.js', 'TypeScript', 'Tailwind CSS', 'Laravel Reverb',
    'Docker', 'GitHub Actions', 'CI/CD', 'Code Review'
];
let selectedSkills = JSON.parse(localStorage.getItem('zedo_selected_skills')) || [...availableSkills];

function renderSkillsSelector() {
    const container = document.getElementById('skills-selector');
    container.innerHTML = '';
    availableSkills.forEach(skill => {
        const active = selectedSkills.includes(skill);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = skill;
        btn.className = active
            ? 'text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 transition'
            : 'text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-500 border border-brand-border hover:text-zinc-300 transition';
        btn.onclick = () => {
            if (selectedSkills.includes(skill)) {
                selectedSkills = selectedSkills.filter(s => s !== skill);
            } else {
                selectedSkills.push(skill);
            }
            localStorage.setItem('zedo_selected_skills', JSON.stringify(selectedSkills));
            renderSkillsSelector();
            updateCV();
        };
        container.appendChild(btn);
    });
}

function updateCV() {
    const fields = ['name', 'role', 'location', 'email', 'github', 'linkedin', 'summary'];
    const data = {};
    fields.forEach(f => {
        data[f] = document.getElementById(`cv-input-${f}`).value;
    });
    data.proj1 = document.getElementById('proj-1').checked;
    data.proj2 = document.getElementById('proj-2').checked;
    data.proj3 = document.getElementById('proj-3').checked;

    localStorage.setItem('zedo_cv_data', JSON.stringify(data));

    const name = data.name || 'Seu Nome Completo';
    document.getElementById('out-name').innerText = name;
    document.getElementById('out-role').innerText = data.role;
    document.getElementById('out-location').innerHTML = `<i class="fa-solid fa-location-dot mr-1"></i> ${data.location || 'Sua Cidade - Remoto'}`;
    document.getElementById('out-email').innerHTML = `<i class="fa-solid fa-envelope mr-1"></i> ${data.email || 'seuemail@exemplo.com'}`;
    document.getElementById('out-links').innerText = `${data.github || 'github.com/seu-usuario'} • ${data.linkedin || 'linkedin.com/in/voce'}`;
    document.getElementById('out-summary').innerText = data.summary || 'Engenheiro(a) de Software Fullstack com sólida experiência no ecossistema PHP 8.4 e Laravel. Especialista em arquitetura limpa (DDD, SOLID), processamento assíncrono com filas distribuídas, otimização de bancos relacionais e desenvolvimento de interfaces reativas com Vue 3, Inertia.js e TypeScript.';

    const outSkills = document.getElementById('out-skills');
    outSkills.innerHTML = selectedSkills.map(s => `<span class="px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-xs font-mono text-zinc-800">${s}</span>`).join('');

    const projectsList = document.getElementById('out-projects');
    projectsList.innerHTML = '';
    if (data.proj1) projectsList.innerHTML += '<li>• <strong>SaaS Multi-Tenant para ONGs:</strong> Arquitetura isolada por tenant, filas prioritárias e auditoria (Laravel 12, PostgreSQL, Redis).</li>';
    if (data.proj2) projectsList.innerHTML += '<li>• <strong>Hub de Mentoria Real-Time:</strong> Plataforma colaborativa com WebSockets e permissões granulares (Inertia.js, Vue 3, Reverb, TypeScript).</li>';
    if (data.proj3) projectsList.innerHTML += '<li>• <strong>API Gateway & Telemetria Aberta:</strong> Ingestão de eventos em alta escala com FrankenPHP, Octane, RabbitMQ e Docker.</li>';

    const hash = btoa(unescape(encodeURIComponent(name))).slice(0, 8).toUpperCase();
    document.getElementById('out-hash').innerText = `✓ ID: ZEDO-${hash}`;
}

function loadSavedCV() {
    const saved = JSON.parse(localStorage.getItem('zedo_cv_data'));
    if (saved) {
        ['name', 'role', 'location', 'email', 'github', 'linkedin', 'summary'].forEach(f => {
            if (saved[f]) document.getElementById(`cv-input-${f}`).value = saved[f];
        });
        document.getElementById('proj-1').checked = saved.proj1 ?? true;
        document.getElementById('proj-2').checked = saved.proj2 ?? true;
        document.getElementById('proj-3').checked = saved.proj3 ?? true;
    }
    selectLesson(0);
    renderSkillsSelector();
    updateCV();
}

function resetCV() {
    if (confirm('Deseja limpar os dados preenchidos no currículo?')) {
        localStorage.removeItem('zedo_cv_data');
        localStorage.removeItem('zedo_selected_skills');
        location.reload();
    }
}

function copyCVText() {
    const text = document.getElementById('cv-preview').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('Texto do currículo copiado! Cole diretamente no seu LinkedIn.');
    });
}

document.addEventListener('DOMContentLoaded', loadSavedCV);
