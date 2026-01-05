document.addEventListener('DOMContentLoaded', function(){
    const questions = Array.prototype.slice.call(document.querySelectorAll('.question'));
    const questionTitle = document.getElementById('question-title');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressPill = document.getElementById('progressPill');
    const timerEl = document.getElementById('timer');

    const submitModal = document.getElementById('submitModal');
    const submitNo = document.getElementById('submitNo');
    const submitYes = document.getElementById('submitYes');

    const params = new URLSearchParams(location.search);
    const chapterRaw = params.get('ch') || '1';
    const chapter = String(chapterRaw).replace(/[^0-9]/g, '') || '1';
    const chapterKey = 'ch' + chapter;

    const correct = {
        q1: 'User control and freedom',
        q2: 'Consistency and standards',
        q3: 'Proximity'
    };

    let currentIndex = 0;

    function setActive(index){
        questions.forEach(function(q, i){
            q.classList.toggle('active', i === index);
        });

        if (questionTitle) questionTitle.textContent = 'Question ' + (index + 1);
        if (progressPill) progressPill.textContent = (index + 1) + ' of ' + questions.length;

        if (prevBtn) prevBtn.disabled = index === 0;
        const isLast = index === questions.length - 1;
        if (nextBtn) nextBtn.style.display = isLast ? 'none' : 'flex';
        if (submitBtn) submitBtn.style.display = isLast ? 'flex' : 'none';
    }

    function openSubmitModal(){
        submitModal.hidden = false;
        submitModal.setAttribute('aria-hidden', 'false');
    }

    function closeSubmitModal(){
        submitModal.hidden = true;
        submitModal.setAttribute('aria-hidden', 'true');
    }

    function allAnswered(){
        return Object.keys(correct).every(function(name){
            return !!document.querySelector('input[name="' + name + '"]:checked');
        });
    }

    function computeScore(){
        let score = 0;
        Object.keys(correct).forEach(function(name){
            const chosen = document.querySelector('input[name="' + name + '"]:checked');
            if (chosen && chosen.value === correct[name]) score += 1;
        });
        return score;
    }

    function submitTest(){
        const score = computeScore();
        const pass = score >= 2;

        localStorage.setItem('hcl_test_result_' + chapterKey, pass ? 'passed' : 'failed');
        localStorage.setItem('hcl_test_last', JSON.stringify({
            chapter: chapterKey,
            outcome: pass ? 'passed' : 'failed',
            score: score,
            total: questions.length,
            at: Date.now()
        }));

        location.href = 'menunotesongoing.html';
    }

    if (prevBtn) prevBtn.addEventListener('click', function(){
        if (currentIndex > 0){
            currentIndex -= 1;
            setActive(currentIndex);
        }
    });

    if (nextBtn) nextBtn.addEventListener('click', function(){
        if (currentIndex < questions.length - 1){
            currentIndex += 1;
            setActive(currentIndex);
        }
    });

    if (submitBtn) submitBtn.addEventListener('click', function(){
        if (!allAnswered()){
            alert('Please answer all questions before submitting.');
            return;
        }
        openSubmitModal();
    });

    if (submitNo) submitNo.addEventListener('click', closeSubmitModal);
    if (submitYes) submitYes.addEventListener('click', function(){
        closeSubmitModal();
        submitTest();
    });

    if (submitModal) submitModal.addEventListener('click', function(e){
        if (e.target === submitModal) closeSubmitModal();
    });

    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && submitModal && !submitModal.hidden) closeSubmitModal();
    });

    // timer (3:05)
    (function(){
        if (!timerEl) return;
        let remaining = 3 * 60 + 5;

        function render(){
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            timerEl.textContent = m + ':' + String(s).padStart(2, '0');
        }

        render();
        setInterval(function(){
            if (remaining <= 0) return;
            remaining -= 1;
            render();
        }, 1000);
    })();

    setActive(0);
});
