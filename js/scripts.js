const sections = [...document.querySelectorAll('section[id]')]
const navList = document.querySelector('#navWrapper nav ul')
const visibleSections = new Map()
const filterChips = [...document.querySelectorAll('.filter-chip')]
const projectCards = [...document.querySelectorAll('.projects-grid .content-card')]

const observerOptions = {
  root: null,
  rootMargin: '-15% 0px -35% 0px',
  threshold: [0.1, 0.25, 0.5, 0.75]
}

const myObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const id = entry.target.id

    if (entry.isIntersecting) {
      visibleSections.set(id, entry.intersectionRatio)
    } else {
      visibleSections.delete(id)
    }
  })

  updateActiveNav()
}, observerOptions)

function setActiveNavItem(navItem) {
  const previousLink = navList?.querySelector('li.active a')
  previousLink?.removeAttribute('aria-current')
  navList?.querySelector('li.active')?.classList.remove('active')

  navItem?.classList.add('active')
  navItem?.querySelector('a')?.setAttribute('aria-current', 'page')
}

function setActiveBySectionId(sectionId) {
  const link = document.querySelector(`a[href="#${sectionId}"]`)
  setActiveNavItem(link?.closest('li'))
}

function updateActiveNav() {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10

  if (nearBottom && sections.length > 0) {
    setActiveBySectionId(sections[sections.length - 1].id)
    return
  }

  let activeSectionId = null
  let highestRatio = -1

  visibleSections.forEach((ratio, id) => {
    if (ratio > highestRatio) {
      highestRatio = ratio
      activeSectionId = id
    }
  })

  if (activeSectionId) {
    setActiveBySectionId(activeSectionId)
  }
}

sections.forEach((section) => {
  myObserver.observe(section)
})

window.addEventListener('scroll', updateActiveNav, { passive: true })
updateActiveNav()

function normalizeFilterValue(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function applyProjectFilter(filterValue) {
  projectCards.forEach((card) => {
    const category = normalizeFilterValue(card.dataset.category || '')
    const shouldShow = filterValue === 'all' || category === filterValue
    card.style.display = shouldShow ? '' : 'none'
  })
}

filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const filterValue = normalizeFilterValue(chip.textContent || '')

    filterChips.forEach((item) => {
      item.classList.remove('active')
      item.setAttribute('aria-pressed', 'false')
    })
    chip.classList.add('active')
    chip.setAttribute('aria-pressed', 'true')

    applyProjectFilter(filterValue)
  })
})

const initialActiveChip = document.querySelector('.filter-chip.active')
if (initialActiveChip) {
  applyProjectFilter(normalizeFilterValue(initialActiveChip.textContent || 'all'))
}

// Reveal cards as they scroll into view (skipped for users who prefer reduced motion)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const revealTargets = [...document.querySelectorAll('.info-card, .content-card')]

if (prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add('is-visible'))
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  )

  revealTargets.forEach((el) => {
    el.classList.add('reveal')
    revealObserver.observe(el)
  })
}