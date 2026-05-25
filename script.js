function throttle(func, wait) {
    let timeout = null;
    let previous = 0;
    return function(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);
        if (remaining <= 0 || remaining > wait) {
            if (timeout) { clearTimeout(timeout); timeout = null; }
            previous = now;
            func.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function rafThrottle(func) {
    let rafId = null;
    let lastArgs = null;
    return function(...args) {
        lastArgs = args;
        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                func.apply(this, lastArgs);
                rafId = null;
            });
        }
    };
}

function initCustomCursor() {
    if ('ontouchstart' in window) return;

    const geoCursor = document.querySelector('.geo-cursor');
    if (geoCursor) {
        document.addEventListener('mousemove', (e) => {
            geoCursor.style.left = `${e.clientX}px`;
            geoCursor.style.top = `${e.clientY}px`;
        }, { passive: true });
    }

    const hoverTargets = 'a, button, .grid-item, .gallery-item';
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            document.body.classList.add('is-hovered');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            document.body.classList.remove('is-hovered');
        }
    }, { passive: true });
}

function initScrollReveal() {
    const options = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
                entry.target.classList.add('is-visible');
                
                const typewriterElements = entry.target.querySelectorAll('.typewriter');
                typewriterElements.forEach(typewriter => {
                    animateTypewriter(typewriter);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, options);

    document.querySelectorAll('.js-reveal-trigger, .fade-in').forEach(section => {
        observer.observe(section);
    });
}

function initGallerySlider() {
    const track = document.querySelector('.marquee-track');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    if (!track || !prevBtn || !nextBtn || !toggleBtn) return;

    let groups = track.querySelectorAll('.marquee-group');
    if (groups.length === 2) {
        track.appendChild(groups[0].cloneNode(true));
    }

    let isManuallyStopped = false;
    let isStepping = false;
    let autoPlayTimer; 
    const intervalTime = 4000; 

    const getItemsPerGroup = () => {
        const group = document.querySelector('.marquee-group');
        return group ? group.querySelectorAll('.gallery-item').length : 5;
    };

    let itemsPerGroup = getItemsPerGroup();
    let currentIndex = itemsPerGroup; 

    const getItemStep = () => {
        const item = document.querySelector('.gallery-item');
        if (!item) return 0;
        const style = window.getComputedStyle(item);
        return item.offsetWidth + parseFloat(style.marginRight);
    };

    const getCenterOffset = () => {
        const marquee = document.querySelector('.gallery-marquee');
        const item = document.querySelector('.gallery-item');
        if (!marquee || !item) return 0;
        return (marquee.offsetWidth - item.offsetWidth) / 2;
    };

    const updateTransform = (withTransition = true) => {
        const step = getItemStep();
        const offset = getCenterOffset();
        const currentX = -(currentIndex * step);

        if (withTransition) {
            track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
            track.style.transition = 'none';
        }
        track.style.transform = `translateX(${currentX + offset}px)`;
    };

    const moveStep = (direction) => {
        if (isStepping) return; 
        isStepping = true;

        itemsPerGroup = getItemsPerGroup();

        if (direction === 'prev') {

            if (currentIndex <= 0) {
                currentIndex += itemsPerGroup;
                updateTransform(false);
                track.offsetHeight;
            }
            currentIndex--;
        } 

        else {
            currentIndex++;
        }

        updateTransform(true);

        setTimeout(() => {
            if (currentIndex >= itemsPerGroup * 2) {
                currentIndex -= itemsPerGroup;
                updateTransform(false);
            }
            isStepping = false; 
        }, 400);
    };

    const startAutoPlay = () => {
        stopAutoPlay(); 
        if (!isManuallyStopped) {
            autoPlayTimer = setInterval(() => moveStep('next'), intervalTime);
        }
    };
    const stopAutoPlay = () => {
        clearInterval(autoPlayTimer);
    };

    updateTransform(false);
    startAutoPlay();

    window.addEventListener('optimizedResize', () => updateTransform(false));

    toggleBtn.addEventListener('click', () => {
        isManuallyStopped = !isManuallyStopped;
        if (isManuallyStopped) {
            toggleBtn.innerHTML = '<i data-lucide="play"></i>';
            stopAutoPlay();
        } else {
            toggleBtn.innerHTML = '<i data-lucide="pause"></i>';
            startAutoPlay();
        }
        lucide.createIcons({ root: toggleBtn });
    });

    prevBtn.addEventListener('click', () => {
        moveStep('prev');
        startAutoPlay(); 
    });
    nextBtn.addEventListener('click', () => {
        moveStep('next');
        startAutoPlay(); 
    });
}

function animateTypewriter(element) {
    const text = element.textContent;
    element.innerHTML = '';
    [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.transitionDelay = `${i * 0.04}s`;
        element.appendChild(span);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            });
        });
    });
}

function initTitleTypewriter() {
    const titleSelectors = [
        '.section-title', '.gallery-title-final', '.TOPIC-side-title',
        '.record-title', '.ana-title', '.doc-title', '.p-about__title',
        '.p-split__title', '.estrucia-masthead-title', '.astral-main-title',
        '.profile-section-title', '.np-ad-title-small'
    ];
    
    titleSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(title => {
            if (!title.classList.contains('typewriter')) {
                title.classList.add('typewriter');
            }
        });
    });
}

function initPageTransition() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.add('is-fade-in');
        }, 100);
    });
    
    document.querySelectorAll('a[href^="#"], a:not([href^="http"])').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#') || link.target === '_blank') return;
            
            e.preventDefault();
            const href = link.getAttribute('href');
            document.body.classList.add('is-fading-out');
            
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const pageTopBtn = document.getElementById('page-top');
    if (pageTopBtn) {
        pageTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initLightbox() {
    const modal = document.getElementById('image-modal');
    const preview = document.getElementById('modal-preview');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!modal || !preview) return;

    const closeModal = () => {
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
    };

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgDiv = item.querySelector('.gallery-img');
            if(imgDiv) {
                const bgImg = imgDiv.style.backgroundImage;
                const url = bgImg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                
                preview.src = url;
                modal.classList.add('is-active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    modal.addEventListener('click', () => {
        closeModal();
    });

    preview.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function initLazyLoad() {
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.loading = 'lazy';
        });
    } else {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

function initResizeHandler() {
    const handleResize = debounce(() => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        window.dispatchEvent(new CustomEvent('optimizedResize'));
    }, 250);
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
}

function logPerformance() {
    if (!window.performance) return;
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page Load Time: ${pageLoadTime}ms`);
        }, 0);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    initCoffeeParallax();

    document.body.classList.add('loaded');
    
    initCustomCursor();
    initTitleTypewriter();
    initScrollReveal();
    initPageTransition();
    initSmoothScroll();
    initLightbox();
    initLazyLoad();
    initResizeHandler();
    
    initGallerySlider(); 

    initHamburger();
    initTopicArchive();

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logPerformance();
    }
});

window.onOpeningComplete = function() {
    console.log('Opening animation complete');
};

window.DemiitasPortfolio = {
    throttle, debounce, rafThrottle,
    initCustomCursor, initTitleTypewriter, initScrollReveal,
    initPageTransition, initSmoothScroll, initLightbox,
    initLazyLoad, initResizeHandler
};

async function initTopicArchive() {
    const listEl = document.getElementById('tp-archive-list');
    const filterBar = document.getElementById('tp-filter-bar');
    const emptyEl = document.getElementById('tp-empty');
    const countEl = document.getElementById('tp-count');
    if (!listEl) return;

    const jsonPath = listEl.dataset.topicsSrc || 'topics.json';

    let topics = [];
    try {
        const res = await fetch(jsonPath);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        topics = (data.topics || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
        console.error('TOPIC list load error:', err);
        if (emptyEl) {
            emptyEl.classList.add('is-visible');
            emptyEl.querySelector('.tp-empty-text').textContent = 'お知らせを読み込めませんでした。';
        }
        return;
    }

    const formatDate = (iso) => {
        const [y, m, d] = iso.split('-');
        return `${y}.${m}.${d}`;
    };

    const tagLabels = { all: 'すべて' };
    topics.forEach((t) => {
        if (t.tag && !tagLabels[t.tag]) tagLabels[t.tag] = t.tagLabel || t.tag;
    });

    let activeFilter = 'all';

    const renderFilters = () => {
        if (!filterBar) return;
        filterBar.innerHTML = '';
        ['all', ...Object.keys(tagLabels).filter((k) => k !== 'all')].forEach((key) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `tp-fbtn${key === activeFilter ? ' active' : ''}`;
            btn.dataset.filter = key;
            btn.textContent = tagLabels[key];
            btn.addEventListener('click', () => {
                activeFilter = key;
                filterBar.querySelectorAll('.tp-fbtn').forEach((b) => b.classList.toggle('active', b.dataset.filter === key));
                renderList();
            });
            filterBar.appendChild(btn);
        });
    };

    const renderList = () => {
        const filtered = activeFilter === 'all'
            ? topics
            : topics.filter((t) => t.tag === activeFilter);

        if (countEl) {
            countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'Topic' : 'Topics'}`;
        }

        listEl.innerHTML = '';

        if (filtered.length === 0) {
            emptyEl?.classList.add('is-visible');
            return;
        }
        emptyEl?.classList.remove('is-visible');

        filtered.forEach((topic, i) => {
            const card = document.createElement('a');
            card.href = `${topic.slug}.html`;
            card.className = 'tp-card fade-in';
            card.style.animationDelay = `${i * 0.06}s`;

            const thumb = document.createElement('div');
            thumb.className = 'tp-card-thumb';
            if (topic.thumb) thumb.style.backgroundImage = `url('${topic.thumb}')`;

            const body = document.createElement('div');
            body.className = 'tp-card-body';
            body.innerHTML = `
                <div class="tp-card-meta">
                    <time datetime="${topic.date}">${formatDate(topic.date)}</time>
                    <span class="tag tag-${topic.tag}">${topic.tagLabel || topic.tag}</span>
                </div>
                <h2 class="tp-card-title"></h2>
                <p class="tp-card-excerpt"></p>
                <span class="tp-card-more">Read more →</span>
            `;
            body.querySelector('.tp-card-title').textContent = topic.title;
            body.querySelector('.tp-card-excerpt').textContent = topic.excerpt || '';

            card.append(thumb, body);
            listEl.appendChild(card);
        });

        if (typeof initScrollReveal === 'function') {
            listEl.querySelectorAll('.fade-in').forEach((el) => {
                el.classList.remove('is-visible');
                const observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            obs.unobserve(entry.target);
                        }
                    });
                }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
                observer.observe(el);
            });
        }
    };

    renderFilters();
    renderList();
}

function initCoffeeParallax() {
    if (window.innerWidth <= 1024) return;

    const coffeeItems = document.querySelectorAll('.parallax-coffee-item');
    if (coffeeItems.length === 0) return;

    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                
                coffeeItems.forEach(item => {
                    const speed = parseFloat(item.getAttribute('data-speed')) || 1.5;
                    item.style.transform = `translateY(-${scrollY * speed}px)`;
                });
                
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

function initHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (!btn || !navLinks) return;
    
    const links = navLinks.querySelectorAll('a');

    btn.addEventListener('click', () => {
        btn.classList.toggle('is-active');
        navLinks.classList.toggle('is-active');
        
        if (navLinks.classList.contains('is-active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('is-active');
            navLinks.classList.remove('is-active');
            document.body.style.overflow = '';
        });
    });
}

window.addEventListener('pageshow', function(event) {
    
    if (event.persisted) {
        window.location.reload();
    }
});