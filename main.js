import * as THREE from 'three';
import { resumeData } from './data.js';

const escapeHTML = (value) => {
    const replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return value.replace(/[&<>"']/g, (character) => replacements[character]);
};

function renderData() {
    document.getElementById('about-text').textContent = resumeData.summary;

    document.getElementById('experience-list').innerHTML = resumeData.experience.map((experience, index) => `
        <article class="experience-item" data-reveal>
            <span class="item-index">${String(index + 1).padStart(2, '0')}</span>
            <div class="experience-main">
                <h3>${escapeHTML(experience.role)}</h3>
                <p class="organization">${escapeHTML(experience.organization)}</p>
                <p>${escapeHTML(experience.description)}</p>
            </div>
            <span class="experience-date">${escapeHTML(experience.duration)}</span>
        </article>
    `).join('');

    document.getElementById('project-list').innerHTML = resumeData.projects.map((project, index) => `
        <article class="project-card${index === 0 ? ' project-card-featured' : ''}" data-reveal>
            <div class="project-meta">
                <span class="project-number">PROJECT / ${String(index + 1).padStart(2, '0')}</span>
                <span class="project-status">${escapeHTML(project.status)}</span>
            </div>
            <h3>${escapeHTML(project.title)}</h3>
            <p>${escapeHTML(project.description)}</p>
            <div class="project-tags">
                ${project.tags.map((tag) => `<span class="project-tag">${escapeHTML(tag)}</span>`).join('')}
            </div>
        </article>
    `).join('');

    document.getElementById('leadership-list').innerHTML = resumeData.leadership.map((leadership) => `
        <article class="leadership-item" data-reveal>
            <span class="experience-date">${escapeHTML(leadership.duration)}</span>
            <h3>${escapeHTML(leadership.role)}</h3>
            <p class="organization">${escapeHTML(leadership.organization)}</p>
            <p>${escapeHTML(leadership.description)}</p>
        </article>
    `).join('');

    document.getElementById('education-list').innerHTML = resumeData.education.map((education) => `
        <article class="education-item" data-reveal>
            <span class="experience-date">${escapeHTML(education.year)}</span>
            <h3>${escapeHTML(education.degree)}</h3>
            <p>${escapeHTML(education.institution)}</p>
            <p class="education-result">${escapeHTML(education.result)}</p>
        </article>
    `).join('');

    document.getElementById('skills-list').innerHTML = Object.entries(resumeData.skills).map(([category, skills]) => `
        <div class="skills-group" data-reveal>
            <h3>${escapeHTML(category)}</h3>
            <div class="skill-list">
                ${skills.map((skill) => `<span class="skill-tag">${escapeHTML(skill)}</span>`).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('social-links').innerHTML = [
        { label: 'GitHub', url: resumeData.contact.github },
        { label: 'LinkedIn', url: resumeData.contact.linkedin }
    ].map(({ label, url }) => `
        <a href="${escapeHTML(url)}" target="_blank" rel="noreferrer">${escapeHTML(label)} <span aria-hidden="true">↗</span></a>
    `).join('');
}

function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.getElementById('nav-links');

    const closeMenu = () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        links.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        toggle.setAttribute('aria-label', isExpanded ? 'Open navigation' : 'Close navigation');
        links.classList.toggle('is-open', !isExpanded);
    });

    links.addEventListener('click', (event) => {
        if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}

function initScrollReveals() {
    if (!('IntersectionObserver' in window)) return;

    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });

    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
}

function initThree() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'low-power'
        });
    } catch (error) {
        console.error('Unable to initialize the portfolio 3D scene.', error);
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x08111b, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xd9f2e5, 1.7));
    const keyLight = new THREE.PointLight(0xb6f28b, 38, 18);
    keyLight.position.set(3, 3, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x82b9ff, 27, 16);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    const centerpiece = new THREE.Group();
    scene.add(centerpiece);

    const coreGeometry = new THREE.IcosahedronGeometry(1.12, 2);
    const core = new THREE.Mesh(
        coreGeometry,
        new THREE.MeshStandardMaterial({
            color: 0x729a86,
            metalness: 0.72,
            roughness: 0.27,
            flatShading: true
        })
    );
    centerpiece.add(core);

    const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.25, 1)),
        new THREE.LineBasicMaterial({ color: 0xb6f28b, transparent: true, opacity: 0.62 })
    );
    centerpiece.add(wireframe);

    const rings = [
        { radius: 1.72, rotation: [0.35, 0.1, -0.24], color: 0x9bcfff },
        { radius: 1.92, rotation: [1.16, 0.4, 0.53], color: 0xb6f28b },
        { radius: 2.12, rotation: [0.6, 1.1, -0.72], color: 0x789ab6 }
    ];

    rings.forEach(({ radius, rotation, color }) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.008, 8, 180),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.61 })
        );
        ring.rotation.set(...rotation);
        centerpiece.add(ring);
    });

    const satellites = [
        { position: [1.65, 0.2, 0.1], radius: 0.075, color: 0xb6f28b },
        { position: [-0.4, 1.68, 0.1], radius: 0.055, color: 0x9bcfff },
        { position: [-1.72, -0.25, 0.2], radius: 0.08, color: 0xb6f28b },
        { position: [0.3, -1.8, 0.2], radius: 0.06, color: 0x9bcfff }
    ];

    satellites.forEach(({ position, radius, color }) => {
        const satellite = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 16),
            new THREE.MeshBasicMaterial({ color })
        );
        satellite.position.set(...position);
        centerpiece.add(satellite);
    });

    const particleCount = 650;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const colors = [new THREE.Color(0xb6f28b), new THREE.Color(0x8ebde8), new THREE.Color(0xd7e5eb)];

    for (let index = 0; index < particleCount; index += 1) {
        particlePositions[index * 3] = (Math.random() - 0.5) * 15;
        particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 10;
        particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particleColors[index * 3] = color.r;
        particleColors[index * 3 + 1] = color.g;
        particleColors[index * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
            size: 0.018,
            vertexColors: true,
            transparent: true,
            opacity: 0.76,
            sizeAttenuation: true
        })
    );
    scene.add(particles);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: 0, y: 0 };
    let isHeroVisible = true;
    let animationFrame = 0;

    const positionCenterpiece = () => {
        const isMobile = window.innerWidth <= 640;
        centerpiece.position.set(isMobile ? 0 : Math.min(window.innerWidth * 0.0018, 2.25), isMobile ? -2.15 : 0.1, 0);
        centerpiece.scale.setScalar(isMobile ? 0.62 : 1);
    };

    const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        positionCenterpiece();
        renderer.render(scene, camera);
    };

    const animate = () => {
        animationFrame = 0;
        if (!isHeroVisible || document.hidden) return;

        centerpiece.rotation.y += 0.0018;
        centerpiece.rotation.x += (pointer.y * 0.12 - centerpiece.rotation.x) * 0.018;
        centerpiece.rotation.z += (-pointer.x * 0.1 - centerpiece.rotation.z) * 0.018;
        particles.rotation.y += 0.00012;
        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
        if (!reducedMotion.matches && isHeroVisible && !document.hidden && !animationFrame) {
            animationFrame = window.requestAnimationFrame(animate);
        }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (event) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        } else {
            startAnimation();
        }
    });
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            renderer.render(scene, camera);
        } else {
            startAnimation();
        }
    });

    if ('IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver(([entry]) => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible) {
                startAnimation();
            } else {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = 0;
            }
        }, { threshold: 0.01 });
        heroObserver.observe(document.querySelector('.hero'));
    }

    positionCenterpiece();
    renderer.render(scene, camera);
    startAnimation();
}

renderData();
initNavigation();
initScrollReveals();
initThree();
