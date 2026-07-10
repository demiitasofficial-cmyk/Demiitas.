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
    initCharacterPage();
    initTopicChronicles();

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

const TOPIC_TAB_LABELS = {
    all: '最新',
    info: 'お知らせ',
    update: '更新',
    work: '依頼',
    art: '作品',
    event: 'イベント'
};

function resolveTopicThumb(thumb, linkBase) {
    if (!thumb || thumb.startsWith('http')) return thumb;
    if (linkBase === 'topic/') {
        if (thumb.startsWith('../')) return thumb.slice(3);
        return `topic/${thumb}`;
    }
    return thumb;
}

function updateTopicBanner(featured, linkBase) {
    const banner = document.querySelector('[data-topic-banner]');
    if (!banner || !featured) return;
    banner.href = `${linkBase}${featured.slug}.html`;
    const thumb = resolveTopicThumb(featured.thumb, linkBase);
    const img = banner.querySelector('img.banner-img');
    if (img && thumb) {
        img.src = thumb;
        img.alt = featured.title || 'Topic banner';
    }
}

async function initCharacterPage() {
    const root = document.querySelector('[data-character-page]');
    if (!root) return;

    const src = root.dataset.characterSrc || 'characters/character.json';
    const jsonPath = new URL(src, window.location.href).href;

    const setText = (sel, text) => {
        const el = root.querySelector(sel);
        if (el && text != null) el.textContent = text;
    };

    let data;
    try {
        const res = await fetch(jsonPath);
        if (!res.ok) throw new Error('fetch failed');
        data = await res.json();
    } catch (err) {
        console.error('Character data load error:', err);
        return;
    }

    const kv = root.querySelector('[data-char-kv]');
    const standing = root.querySelector('[data-char-standing]');
    const bio = root.querySelector('[data-char-bio]');
    const quote = root.querySelector('[data-char-quote]');
    const ytPlayer = root.querySelector('[data-char-yt-player]');
    const ytTitle = root.querySelector('[data-char-yt-video-title]');

    if (kv && data.kvImage) {
        kv.src = data.kvImage;
        kv.alt = `${data.nameJa || 'Character'} — Key Visual`;
    }
    if (standing && data.standingImage) {
        standing.src = data.standingImage;
        standing.alt = data.nameJa || 'Character standing';
    }

    setText('[data-char-role]', data.role);
    setText('[data-char-name-ja]', data.nameJa);
    setText('[data-char-name-en]', data.nameEn);
    setText('[data-char-yt-desc]', data.youtube?.videoDescription);

    if (bio && Array.isArray(data.paragraphs)) {
        bio.innerHTML = '';
        data.paragraphs.forEach((paragraph) => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            bio.appendChild(p);
        });
    }

    if (quote) {
        if (data.quote) {
            quote.textContent = data.quote;
            quote.hidden = false;
        } else {
            quote.hidden = true;
        }
    }

    const yt = data.youtube || {};
    const channelUrl = yt.channelUrl || 'https://www.youtube.com/channel/UCnWDEpYvIh0Mpjo70ui6bPQ';

    if (ytPlayer) {
        if (yt.videoId) {
            ytPlayer.innerHTML = `
                <iframe
                  src="https://www.youtube-nocookie.com/embed/${yt.videoId}"
                  title="${yt.videoTitle || 'YouTube video'}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  loading="lazy"></iframe>`;
            if (ytTitle && yt.videoTitle) {
                ytTitle.textContent = yt.videoTitle;
            }
        } else {
            const placeholder = ytPlayer.querySelector('.char-youtube-placeholder');
            const link = ytPlayer.querySelector('.char-youtube-channel-btn');
            if (link) link.href = channelUrl;
            if (placeholder && !placeholder.querySelector('a')) {
                /* keep default */
            }
        }
    }
}

async function initTopicChronicles() {
    const widgets = document.querySelectorAll('[data-topic-widget]');
    if (!widgets.length) return;

    const formatDate = (iso) => {
        const [y, m, d] = iso.split('-');
        return `${y}.${m}.${d}`;
    };

    for (const widget of widgets) {
        const feedEl = widget.closest('.topic-split-feed');
        const tabsEl = feedEl?.querySelector('[data-topic-tabs]') || widget.querySelector('[data-topic-tabs]');
        const listEl = widget.querySelector('[data-topic-list]');
        const emptyEl = widget.querySelector('[data-topic-empty]');
        const countEl = feedEl?.querySelector('#tp-count') || document.getElementById('tp-count');

        if (!tabsEl || !listEl) continue;

        const src = widget.dataset.topicsSrc || 'topic/topics.json';
        const jsonPath = new URL(src, window.location.href).href;
        const linkBase = widget.dataset.linkBase ?? 'topic/';
        const limit = parseInt(widget.dataset.limit, 10) || 0;
        let topics = [];

        try {
            const res = await fetch(jsonPath);
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();
            topics = (data.topics || []).slice().sort((a, b) => b.date.localeCompare(a.date));
        } catch (err) {
            console.error('TOPIC list load error:', err);
            emptyEl?.classList.add('is-visible');
            if (emptyEl) emptyEl.textContent = 'お知らせを読み込めませんでした。';
            continue;
        }

        if (topics.length === 0) {
            emptyEl?.classList.add('is-visible');
            continue;
        }

        const featured = topics.find((t) => t.featured) || topics[0];
        updateTopicBanner(featured, linkBase);

        const tagOrder = ['info', 'update', 'work', 'art', 'event'];
        const tagSet = new Set(topics.map((t) => t.tag).filter(Boolean));
        const tagKeys = ['all', ...tagOrder.filter((k) => tagSet.has(k)), ...[...tagSet].filter((k) => !tagOrder.includes(k))];

        let activeFilter = 'all';
        let itemNodes = [];

        const buildItems = () => {
            listEl.innerHTML = '';
            const displayTopics = limit > 0 ? topics.slice(0, limit) : topics;
            itemNodes = displayTopics.map((topic) => {
                const item = document.createElement('a');
                item.href = `${linkBase}${topic.slug}.html`;
                item.className = 'topic-item';
                item.dataset.category = topic.tag;

                const tagText = topic.slug === topics[0]?.slug
                    ? '最新'
                    : (topic.tagLabel || TOPIC_TAB_LABELS[topic.tag] || topic.tag);

                item.innerHTML = `
                    <span class="topic-tag"></span>
                    <span class="topic-content"></span>
                    <time class="topic-date" datetime="${topic.date}"></time>
                `;
                item.querySelector('.topic-tag').textContent = tagText;
                item.querySelector('.topic-content').textContent = topic.title;
                item.querySelector('.topic-date').textContent = formatDate(topic.date);
                listEl.appendChild(item);
                return item;
            });
        };

        const animateVisible = () => {
            let delay = 0;
            itemNodes.forEach((item) => {
                item.classList.remove('is-animating', 'is-hidden');
                item.style.animationDelay = '0s';
                if (activeFilter === 'all' || item.dataset.category === activeFilter) {
                    item.classList.remove('is-hidden');
                    item.style.animationDelay = `${delay * 0.1}s`;
                    void item.offsetWidth;
                    item.classList.add('is-animating');
                    delay++;
                } else {
                    item.classList.add('is-hidden');
                }
            });
        };

        const updateCount = () => {
            if (!countEl) return;
            const n = activeFilter === 'all'
                ? topics.length
                : topics.filter((t) => t.tag === activeFilter).length;
            countEl.textContent = `${n} ${n === 1 ? 'Topic' : 'Topics'}`;
        };

        const applyFilter = (filter) => {
            activeFilter = filter;
            tabsEl.querySelectorAll('.topic-tab-btn').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.target === filter);
            });
            if (itemNodes.length === 0) {
                emptyEl?.classList.add('is-visible');
                updateCount();
                return;
            }
            const visible = activeFilter === 'all'
                ? itemNodes.length
                : itemNodes.filter((el) => el.dataset.category === activeFilter).length;
            emptyEl?.classList.toggle('is-visible', visible === 0);
            animateVisible();
            updateCount();
        };

        tabsEl.innerHTML = '';
        tagKeys.forEach((key) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `topic-tab-btn${key === 'all' ? ' active' : ''}`;
            btn.dataset.target = key;
            btn.textContent = TOPIC_TAB_LABELS[key] || key.toUpperCase();
            btn.addEventListener('click', () => applyFilter(key));
            tabsEl.appendChild(btn);
        });

        buildItems();
        applyFilter('all');
    }
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