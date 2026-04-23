import * as THREE from 'three';
import { resumeData } from './data.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    renderData();
    initAnimations();
    lucide.createIcons();
    // Ensure scroll triggers are calculated after content is injected
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 100);
});

// --- THREE.JS BACKGROUND ---
function initThree() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles
    const particlesCount = 1500;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
        colors[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.015,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 3;

    // Mouse movement influence
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);
        
        points.rotation.y += 0.001;
        points.rotation.x += 0.0005;

        // Smoothly follow mouse
        scene.rotation.y += (mouseX - scene.rotation.y) * 0.05;
        scene.rotation.x += (mouseY - scene.rotation.x) * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- DATA RENDERING ---
function renderData() {
    // About
    document.getElementById('about-text').textContent = resumeData.summary;

    // Education
    const eduList = document.getElementById('education-list');
    resumeData.education.forEach(edu => {
        eduList.innerHTML += `
            <div class="experience-card glass">
                <div class="card-header">
                    <h3 class="card-role">${edu.degree}</h3>
                    <span class="card-duration">${edu.year}</span>
                </div>
                <h4 style="margin-bottom: 0.5rem; color: var(--text-dim);">${edu.institution}</h4>
                ${edu.cgpa ? `<p>CGPA: ${edu.cgpa}</p>` : ''}
                ${edu.percentage ? `<p>Percentage: ${edu.percentage}</p>` : ''}
            </div>
        `;
    });

    // Experience
    const expList = document.getElementById('experience-list');
    resumeData.experience.forEach(exp => {
        expList.innerHTML += `
            <div class="experience-card glass">
                <div class="card-header">
                    <h3 class="card-role">${exp.role}</h3>
                    <span class="tag">${exp.type}</span>
                </div>
                <p style="color: var(--text-dim); margin-bottom: 1rem;">${exp.description}</p>
            </div>
        `;
    });

    // Leadership
    const leadList = document.getElementById('leadership-list');
    resumeData.leadership.forEach(lead => {
        leadList.innerHTML += `
            <div class="experience-card glass">
                <div class="card-header">
                    <h3 class="card-role">${lead.role}</h3>
                    <span class="card-duration">${lead.duration}</span>
                </div>
                <h4 style="margin-bottom: 0.5rem; color: var(--text-dim);">${lead.organization}</h4>
                <p>${lead.description}</p>
            </div>
        `;
    });

    // Projects
    const projGrid = document.getElementById('project-list');
    resumeData.projects.forEach(proj => {
        projGrid.innerHTML += `
            <div class="project-card glass">
                <h3 style="font-size: 1.5rem;">${proj.title}</h3>
                <div class="project-tags">
                    ${proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <p style="color: var(--text-dim); font-size: 0.9rem;">${proj.description}</p>
                <div style="margin-top: auto; padding-top: 1rem;">
                    <a href="#" class="social-link" style="font-size: 0.8rem; font-weight: 600; text-decoration: none;">VIEW DETAILS →</a>
                </div>
            </div>
        `;
    });

    // Skills
    const skillsList = document.getElementById('skills-list');
    const technical = resumeData.skills.technical || [];
    const algorithms = resumeData.skills.algorithms || [];
    const additional = resumeData.skills.additional || [];
    const allSkills = [...technical, ...algorithms, ...additional];
    
    if (skillsList) {
        skillsList.innerHTML = '';
        allSkills.forEach(skill => {
            skillsList.innerHTML += `<div class="skill-tag glass">${skill}</div>`;
        });
    }
}

// --- GSAP ANIMATIONS ---
function initAnimations() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero Entry
    gsap.to('#hero-title', { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: 0.2 });
    gsap.to('#hero-subtitle', { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: 0.4 });
    gsap.to('.cta-group', { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: 0.6 });

    // Section Reveals
    const sections = ['#about', '#education', '#experience', '#leadership', '#projects', '#skills', '#contact'];
    sections.forEach(selector => {
        const el = document.querySelector(`${selector} .container`);
        if (!el) return;
        
        gsap.fromTo(el, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1,
                scrollTrigger: {
                    trigger: selector,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Stagger items - Education
    const eduItems = document.querySelectorAll('#education-list .experience-card');
    if (eduItems.length) {
        gsap.fromTo(eduItems,
            { opacity: 0, x: -20 },
            {
                opacity: 1,
                x: 0,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '#education-list',
                    start: 'top 85%'
                }
            }
        );
    }

    // Stagger items - Experience
    const expItems = document.querySelectorAll('#experience-list .experience-card');
    if (expItems.length) {
        gsap.fromTo(expItems,
            { opacity: 0, x: -20 },
            {
                opacity: 1,
                x: 0,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '#experience-list',
                    start: 'top 85%'
                }
            }
        );
    }

    // Stagger items - Leadership
    const leadItems = document.querySelectorAll('#leadership-list .experience-card');
    if (leadItems.length) {
        gsap.fromTo(leadItems,
            { opacity: 0, x: -20 },
            {
                opacity: 1,
                x: 0,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '#leadership-list',
                    start: 'top 85%'
                }
            }
        );
    }

    // Stagger items - Projects
    const projItems = document.querySelectorAll('#project-list .project-card');
    if (projItems.length) {
        gsap.fromTo(projItems,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '#project-list',
                    start: 'top 85%'
                }
            }
        );
    }

    // Stagger items - Skills
    const skillItems = document.querySelectorAll('.skill-tag');
    if (skillItems.length) {
        gsap.fromTo(skillItems,
            { opacity: 0, scale: 0.9 },
            {
                opacity: 1,
                scale: 1,
                stagger: 0.01,
                duration: 0.4,
                scrollTrigger: {
                    trigger: '#skills-list',
                    start: 'top 90%'
                }
            }
        );
    }
}
