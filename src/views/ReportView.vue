<template>
  <div class="report">
    <section class="hero">
      <router-link to="/" class="back-link">← Retour aux horaires</router-link>
      <p class="eyebrow">Aidez-nous à améliorer</p>
      <h1>Signaler une erreur</h1>
      <p class="lede">Vous avez remarqué un horaire incorrect? Faites-le nous savoir.</p>
    </section>

    <section class="form-section">
      <form @submit.prevent="submitReport" class="report-form">
        <!-- Facility Selection -->
        <div class="form-group">
          <label for="facility">Installation concernée</label>
          <select id="facility" v-model="form.facility_id" required>
            <option :value="null">Sélectionnez une installation</option>
            <option 
              v-for="facility in facilities" 
              :key="facility.id" 
              :value="facility.id"
            >
              {{ facility.name }}
            </option>
          </select>
        </div>

        <!-- Report Message -->
        <div class="form-group">
          <label for="message">Description du problème</label>
          <textarea 
            id="message" 
            v-model="form.message" 
            rows="5" 
            required
            placeholder="Décrivez l'erreur que vous avez remarquée (ex: 'L'horaire indique 14h mais la piscine est fermée à ce moment-là')"
          ></textarea>
        </div>

        <!-- Optional Contact -->
        <div class="form-group optional">
          <label for="contact">Votre email (optionnel)</label>
          <input 
            id="contact" 
            v-model="form.contact" 
            type="email"
            placeholder="pour vous recontacter si besoin"
          />
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="submitting || !isValid"
          >
            <span v-if="submitting">Envoi en cours...</span>
            <span v-else>Envoyer le rapport</span>
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div v-if="success" class="success-message">
        <h3>✓ Rapport envoyé</h3>
        <p>Merci pour votre contribution! Notre équipe va examiner votre signalement.</p>
        <div class="actions">
          <router-link to="/" class="btn-link">Retour aux horaires</router-link>
          <button @click="resetForm" class="btn-link secondary">
            Signaler autre chose
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <h3>✗ Une erreur est survenue</h3>
        <p>{{ error }}</p>
        <button @click="error = null" class="btn-link">Réessayer</button>
      </div>
    </section>

    <!-- AI Verification Info -->
    <section class="info-section">
      <h2>Comment ça marche?</h2>
      <div class="steps">
        <div class="step">
          <span class="step-number">1</span>
          <p>Vous signalez une erreur via ce formulaire</p>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <p>Notre système IA vérifie automatiquement les données</p>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <p>Nous mettons à jour les horaires si nécessaire</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFacilities, submitReport } from '../api/client'

const route = useRoute()

const facilities = ref([])
const loading = ref(false)
const submitting = ref(false)
const success = ref(false)
const error = ref(null)

const form = ref({
  facility_id: null,
  message: '',
  contact: ''
})

const isValid = computed(() => {
  return form.value.facility_id !== null && form.value.message.trim().length > 10
})

const loadFacilities = async () => {
  try {
    loading.value = true
    facilities.value = await getFacilities()
    
    // Pre-select facility if passed in URL
    const preselectedFacility = route.query.facility
    if (preselectedFacility) {
      form.value.facility_id = parseInt(preselectedFacility)
    }
  } catch (e) {
    console.error('Failed to load facilities:', e)
    error.value = "Impossible de charger la liste des installations"
  } finally {
    loading.value = false
  }
}

const submitReport = async () => {
  if (!isValid.value) return

  submitting.value = true
  error.value = null

  try {
    await submitReport({
      facility_id: form.value.facility_id,
      message: form.value.message,
      reporter_platform: 'web',
      reporter_id: form.value.contact || 'anonymous'
    })
    
    success.value = true
  } catch (e) {
    console.error('Failed to submit report:', e)
    error.value = "Erreur lors de l'envoi du rapport. Veuillez réessayer."
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    facility_id: null,
    message: '',
    contact: ''
  }
  success.value = false
  error.value = null
}

onMounted(() => {
  loadFacilities()
})
</script>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent);
}

.hero {
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 32px;
}

.eyebrow {
  color: var(--accent);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.lede {
  color: var(--muted);
  font-size: 16px;
}

.form-section {
  max-width: 600px;
  margin-bottom: 40px;
}

.report-form {
  background: var(--card);
  border-radius: 8px;
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.optional label::after {
  content: " (optionnel)";
  color: var(--muted);
  font-weight: normal;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--muted);
}

.form-actions {
  margin-top: 24px;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  border: none;
  border-radius: 6px;
  color: var(--bg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message,
.error-message {
  background: var(--card);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
}

.success-message {
  border-left: 4px solid #22c55e;
}

.error-message {
  border-left: 4px solid #ef4444;
}

.success-message h3,
.error-message h3 {
  font-size: 20px;
  margin-bottom: 12px;
}

.success-message p,
.error-message p {
  color: var(--muted);
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-link {
  display: inline-block;
  padding: 10px 20px;
  background: var(--accent);
  color: var(--bg);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

.btn-link.secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.info-section {
  background: var(--card);
  border-radius: 8px;
  padding: 24px;
}

.info-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  display: flex;
  align-items: center;
  gap: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--accent);
  color: var(--bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.step p {
  color: var(--muted);
  font-size: 14px;
}
</style>
