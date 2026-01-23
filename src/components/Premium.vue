<template>
  <section class="premium">
    <div class="container">
      <div class="premium-card glass disabled">
        <div class="premium-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#gradient1)"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#gradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="12">
                <stop offset="0%" stop-color="#ff6b35"/>
                <stop offset="100%" stop-color="#f7931e"/>
              </linearGradient>
              <linearGradient id="gradient2" x1="2" y1="12" x2="22" y2="17">
                <stop offset="0%" stop-color="#ff6b35"/>
                <stop offset="100%" stop-color="#f7931e"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <h2 class="premium-title">Откройте премиум-доступ</h2>
        <p class="premium-description">
          Получайте персональные рекомендации и смотрите любимое аниме офлайн. Присоединяйтесь к тысячам фанатов, наслаждающихся нашей библиотекой.
        </p>
        
        <div class="premium-actions">
          <button class="btn-premium" disabled>Начать бесплатный пробный период</button>
          <button class="btn-plans glass-dark" disabled>Посмотреть тарифы</button>
        </div>
        
        <div class="premium-features">
          <div class="feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Персональные рекомендации по предпочтениям</span>
          </div>
          <div class="feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Офлайн-просмотр</span>
          </div>
        </div>
        
        <div class="overlay-lock">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p>Скоро будет доступно</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.premium {
  padding: 60px 0 80px;
  width: 100%;
  overflow-x: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.premium-card {
  border-radius: 24px;
  padding: 64px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.premium-card.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.overlay-lock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 100;
  color: #fff;
  pointer-events: none;
}

.overlay-lock svg {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
}

.overlay-lock p {
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.premium-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.premium-icon {
  display: inline-flex;
  margin-bottom: 24px;
}

.premium-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.premium-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.premium-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 48px;
}

.btn-premium {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: #fff;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: not-allowed;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
}

.btn-premium:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-plans {
  color: #fff;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: not-allowed;
}

.btn-plans:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.premium-features {
  display: flex;
  gap: 48px;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.feature svg {
  color: #ff6b35;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .premium-card {
    padding: 40px 24px;
  }
  
  .premium-title {
    font-size: 28px;
  }
  
  .premium-description {
    font-size: 14px;
  }
  
  .premium-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-premium, .btn-plans {
    width: 100%;
    justify-content: center;
  }
  
  .premium-features {
    flex-direction: column;
    gap: 16px;
  }
  
  .feature {
    justify-content: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .premium {
    padding: 30px 0 50px;
  }
  
  .container {
    padding: 0 8px;
  }
  
  .premium-card {
    padding: 24px 12px;
    border-radius: 12px;
  }
  
  .premium-icon {
    margin-bottom: 16px;
  }
  
  .premium-icon svg {
    width: 36px;
    height: 36px;
  }
  
  .premium-title {
    font-size: 20px;
    margin-bottom: 12px;
  }
  
  .premium-description {
    font-size: 12px;
    margin-bottom: 20px;
    padding: 0 8px;
  }
  
  .premium-actions {
    gap: 10px;
    margin-bottom: 24px;
  }
  
  .btn-premium, .btn-plans {
    padding: 10px 20px;
    font-size: 13px;
    border-radius: 10px;
  }
  
  .premium-features {
    gap: 12px;
  }
  
  .feature {
    font-size: 12px;
  }
  
  .feature svg {
    width: 16px;
    height: 16px;
  }
}

</style>
