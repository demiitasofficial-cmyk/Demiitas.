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
    const overlay = document.getElementById('page-overlay');
    
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

function initHeroSlider() {
    const heroSection = document.getElementById('hero-slider');
    if (!heroSection) return;

    const heroImages = heroSection.querySelectorAll('.hero-image');
    let currentHeroIndex = 0;

    if (heroImages.length > 1) {
        setInterval(() => {
            heroSection.classList.remove('is-leaving');
            heroSection.classList.add('is-entering');
            
            setTimeout(() => {
                heroImages[currentHeroIndex].classList.remove('is-active');
                currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
                heroImages[currentHeroIndex].classList.add('is-active');
                
                heroSection.classList.remove('is-entering');
                heroSection.classList.add('is-leaving');
                
                setTimeout(() => {
                    heroSection.classList.add('is-resetting');
                    heroSection.classList.remove('is-leaving');
                    setTimeout(() => {
                        heroSection.classList.remove('is-resetting');
                    }, 100); 
                }, 2200); 
            }, 2200); 
        }, 7000);
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
    initHeroSlider();
    initLightbox();
    initLazyLoad();
    initResizeHandler();
    
    initGallerySlider(); 

    initHamburger();

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
    initPageTransition, initSmoothScroll, initHeroSlider, initLightbox,
    initLazyLoad, initResizeHandler
};

function initCoffeeParallax() {
    if (window.innerWidth <= 768) return;

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