// Password Generator
function initPasswordTool() {
    const modal = createModal('passwordModal', '🔐 Password Generator');
    modal.innerHTML += `
        <div class="input-group">
            <label>Длина пароля: <span id="pwdLength">16</span></label>
            <input type="range" min="8" max="64" value="16" id="pwdLengthSlider" style="width: 100%;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 1rem 0;">
            <label class="checkbox-row"><input type="checkbox" id="pwdUpper" checked> Заглавные (A-Z)</label>
            <label class="checkbox-row"><input type="checkbox" id="pwdLower" checked> Строчные (a-z)</label>
            <label class="checkbox-row"><input type="checkbox" id="pwdNumbers" checked> Цифры (0-9)</label>
            <label class="checkbox-row"><input type="checkbox" id="pwdSymbols" checked> Символы (!@#$)</label>
        </div>
        <button class="search-btn" id="generatePwdBtn">Генерировать</button>
        <div class="output-box" id="pwdOutput" style="font-size: 1.2rem; text-align: center; cursor: pointer;" title="Нажмите для копирования">Нажмите "Генерировать"</div>
        <div id="pwdStrength" style="margin-top: 0.5rem; text-align: center;"></div>
    `;
    
    document.getElementById('pwdLengthSlider').addEventListener('input', (e) => {
        document.getElementById('pwdLength').textContent = e.target.value;
    });
    
    document.getElementById('generatePwdBtn').addEventListener('click', () => {
        const length = parseInt(document.getElementById('pwdLengthSlider').value);
        const upper = document.getElementById('pwdUpper').checked;
        const lower = document.getElementById('pwdLower').checked;
        const numbers = document.getElementById('pwdNumbers').checked;
        const symbols = document.getElementById('pwdSymbols').checked;
        
        let chars = '';
        if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (numbers) chars += '0123456789';
        if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (!chars) {
            document.getElementById('pwdOutput').innerHTML = '<div style="color: #ff6b6b;">Выберите хотя бы один тип символов</div>';
            return;
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        document.getElementById('pwdOutput').textContent = password;
        
        // Strength check
        let strength = 0;
        if (length >= 12) strength++;
        if (length >= 16) strength++;
        if (upper && lower) strength++;
        if (numbers) strength++;
        if (symbols) strength++;
        
        const strengthText = ['Слабый', 'Средний', 'Хороший', 'Сильный', 'Очень сильный'][Math.min(strength, 4)];
        const strengthColor = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#51cf66'][Math.min(strength, 4)];
        document.getElementById('pwdStrength').innerHTML = `<strong>Надёжность:</strong> <span style="color: ${strengthColor}">${strengthText}</span>`;
    });
    
    document.getElementById('pwdOutput').addEventListener('click', () => {
        const text = document.getElementById('pwdOutput').textContent;
        if (text && text !== 'Нажмите "Генерировать"') {
            navigator.clipboard.writeText(text);
            const original = document.getElementById('pwdOutput').textContent;
            document.getElementById('pwdOutput').textContent = '✓ Скопировано!';
            setTimeout(() => {
                document.getElementById('pwdOutput').textContent = original;
            }, 1000);
        }
    });
}

// Domain Checker
function initDomainTool() {
    const modal = createModal('domainModal', '🌍 Domain Checker');
    modal.innerHTML += `
        <div class="input-group">
            <label>Домен</label>
            <input type="text" class="input-field" id="domainInput" placeholder="example.com">
        </div>
        <button class="search-btn" id="checkDomainBtn">Проверить</button>
        <div class="output-box" id="domainOutput">Введите домен для проверки</div>
    `;
    
    document.getElementById('checkDomainBtn').addEventListener('click', async () => {
        const domain = document.getElementById('domainInput').value.trim().replace(/^https?:\/\//, '');
        if (!domain) {
            document.getElementById('domainOutput').innerHTML = '<div style="color: #ff6b6b;">Введите домен</div>';
            return;
        }
        
        document.getElementById('domainOutput').innerHTML = '<div class="loading">Проверка...</div>';
        
        try {
            const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
            const data = await response.json();
            
            let output = `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">📍 Основная информация</div>
                <div><strong>Домен:</strong> ${domain}</div>
                <div><strong>Статус:</strong> ${data.Status === 0 ? '<span style="color: #51cf66">Активен ✓</span>' : '<span style="color: #ff6b6b">Не найден ✗</span>'}</div>
            </div>`;
            
            if (data.Answer) {
                output += `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">🌐 DNS записи</div>`;
                data.Answer.forEach(record => {
                    output += `<div><strong>${record.type === 1 ? 'A' : 'Type ' + record.type}:</strong> ${record.data}</div>`;
                });
                output += `</div>`;
            }
            
            // Check SSL
            try {
                const sslCheck = await fetch(`https://${domain}`, { mode: 'no-cors' });
                output += `<div><div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">🔒 SSL</div>
                    <div><strong>HTTPS:</strong> <span style="color: #51cf66">Доступен ✓</span></div></div>`;
            } catch {
                output += `<div><div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">🔒 SSL</div>
                    <div><strong>HTTPS:</strong> <span style="color: #ff6b6b">Недоступен ✗</span></div></div>`;
            }
            
            document.getElementById('domainOutput').innerHTML = output;
        } catch (error) {
            document.getElementById('domainOutput').innerHTML = `<div style="color: #ff6b6b;">Ошибка: ${error.message}</div>`;
        }
    });
}

// Email Validator
function initEmailTool() {
    const modal = createModal('emailModal', '📧 Email Validator');
    modal.innerHTML += `
        <div class="input-group">
            <label>Email адрес</label>
            <input type="text" class="input-field" id="emailInput" placeholder="user@example.com">
        </div>
        <button class="search-btn" id="validateEmailBtn">Проверить</button>
        <div class="output-box" id="emailOutput">Введите email для проверки</div>
    `;
    
    document.getElementById('validateEmailBtn').addEventListener('click', async () => {
        const email = document.getElementById('emailInput').value.trim();
        if (!email) {
            document.getElementById('emailOutput').innerHTML = '<div style="color: #ff6b6b;">Введите email</div>';
            return;
        }
        
        document.getElementById('emailOutput').innerHTML = '<div class="loading">Проверка...</div>';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        const [username, domain] = email.split('@');
        
        let output = `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">📧 Основная информация</div>
            <div><strong>Email:</strong> ${email}</div>
            <div><strong>Формат:</strong> ${isValid ? '<span style="color: #51cf66">Валидный ✓</span>' : '<span style="color: #ff6b6b">Невалидный ✗</span>'}</div>
            <div><strong>Пользователь:</strong> ${username}</div>
            <div><strong>Домен:</strong> ${domain || 'N/A'}</div>
        </div>`;
        
        if (domain) {
            try {
                const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
                const data = await response.json();
                
                output += `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">🌐 Домен</div>
                    <div><strong>Статус:</strong> ${data.Status === 0 ? '<span style="color: #51cf66">Существует ✓</span>' : '<span style="color: #ff6b6b">Не найден ✗</span>'}</div>`;
                
                if (data.Answer) {
                    output += `<div><strong>MX записи:</strong> Найдены (${data.Answer.length})</div>`;
                    data.Answer.slice(0, 3).forEach(mx => {
                        output += `<div style="margin-left: 1rem;">• ${mx.data}</div>`;
                    });
                }
                output += `</div>`;
            } catch {}
        }
        
        // Disposable email check
        const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email'];
        const isDisposable = disposableDomains.some(d => domain?.includes(d));
        
        output += `<div><div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">🔍 Анализ</div>
            <div><strong>Одноразовый:</strong> ${isDisposable ? '<span style="color: #ff6b6b">Да ⚠️</span>' : '<span style="color: #51cf66">Нет ✓</span>'}</div>
            <div><strong>Длина:</strong> ${email.length} символов</div></div>`;
        
        document.getElementById('emailOutput').innerHTML = output;
    });
}

// Hash Generator
function initHashTool() {
    const modal = createModal('hashModal', '🔍 Hash Generator');
    modal.innerHTML += `
        <div class="input-group">
            <label>Текст для хеширования</label>
            <textarea class="input-field" id="hashInput" placeholder="Введите текст..." style="min-height: 80px; resize: vertical;"></textarea>
        </div>
        <div class="input-group">
            <label>Алгоритм</label>
            <select class="input-field" id="hashAlgo">
                <option value="SHA-1">SHA-1</option>
                <option value="SHA-256" selected>SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
            </select>
        </div>
        <button class="search-btn" id="generateHashBtn">Генерировать</button>
        <div class="output-box" id="hashOutput" style="word-break: break-all; cursor: pointer;" title="Нажмите для копирования">Введите текст для хеширования</div>
    `;
    
    document.getElementById('generateHashBtn').addEventListener('click', async () => {
        const text = document.getElementById('hashInput').value;
        const algo = document.getElementById('hashAlgo').value;
        
        if (!text) {
            document.getElementById('hashOutput').innerHTML = '<div style="color: #ff6b6b;">Введите текст</div>';
            return;
        }
        
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await crypto.subtle.digest(algo, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            document.getElementById('hashOutput').innerHTML = `
                <div style="margin-bottom: 0.5rem;"><strong>Алгоритм:</strong> ${algo}</div>
                <div style="margin-bottom: 0.5rem;"><strong>Длина:</strong> ${hashHex.length} символов</div>
                <div style="margin-bottom: 0.5rem;"><strong>Hash:</strong></div>
                <div style="background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 5px; font-family: monospace;">${hashHex}</div>
            `;
        } catch (error) {
            document.getElementById('hashOutput').innerHTML = `<div style="color: #ff6b6b;">Ошибка: ${error.message}</div>`;
        }
    });
    
    document.getElementById('hashOutput').addEventListener('click', () => {
        const hashDiv = document.getElementById('hashOutput').querySelector('div:last-child');
        if (hashDiv && hashDiv.textContent.length > 20) {
            navigator.clipboard.writeText(hashDiv.textContent);
            const original = hashDiv.textContent;
            hashDiv.textContent = '✓ Скопировано!';
            setTimeout(() => {
                hashDiv.textContent = original;
            }, 1000);
        }
    });
}

// Helper function to create modal
function createModal(id, title) {
    const existing = document.getElementById(id);
    if (existing) return existing;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = id;
    modal.innerHTML = `
        <div class="modal-header">
            <div class="modal-title">${title}</div>
            <button class="close-btn" onclick="closeModal('${id}')">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
    document.getElementById('overlay').classList.add('show');
}

// Initialize all tools
document.addEventListener('DOMContentLoaded', () => {
    initPasswordTool();
    initDomainTool();
    initEmailTool();
    initHashTool();
});
