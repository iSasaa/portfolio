"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import { PerspectiveCamera, OrthographicCamera, useKeyboardControls, KeyboardControls, Billboard, Text, Html, Sparkles, Edges, Stats } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { RaceTimer } from "./RaceTimer";
import { Leaderboard } from "./Leaderboard";

// --- CONTROLS ---
enum Controls {
    forward = 'forward',
    back = 'back',
    left = 'left',
    right = 'right',
    reset = 'reset',
    drift = 'drift',
}

// --- CHECKPOINT DATA ---
const CHECKPOINTS = [
    { id: 0, x: 0, z: 20, color: "#FBBF24", label: "START", segmentType: 'straight' },
    { id: 1, x: 28, z: 30, color: "#FBBF24", label: "ABOUT", segmentType: 'curve' },
    { id: 2, x: 28, z: 80, color: "#FBBF24", label: "SKILLS", segmentType: 'straight', rotationOffset: -30 * (Math.PI / 180) },
    { id: 3, x: 5, z: 80, color: "#FBBF24", label: "PROJECTS 1", segmentType: 'curve' },
    { id: 4, x: -12, z: 50, color: "#FBBF24", label: "PROJECTS 2", segmentType: 'curve' },
    { id: 5, x: -18, z: 90, color: "#FBBF24", label: "CONTACT", segmentType: 'curve' },
    { id: 6, x: 20, z: 120, color: "#FBBF24", label: "EXP 1", segmentType: 'curve' },
    { id: 7, x: -12, z: 150, color: "#FBBF24", label: "EXP 2", segmentType: 'curve' },
    { id: 8, x: 0, z: 170, color: "#FBBF24", label: "EXP 3", segmentType: 'curve' },
    { id: 9, x: 20, z: 165, color: "#FBBF24", label: "MISC", segmentType: 'curve' },
    { id: 10, x: 28, z: 220, color: "#FBBF24", label: "SOCIALS", segmentType: 'straight', rotationOffset: -45 * (Math.PI / 180) },
    { id: 11, x: 0, z: 225, color: "#FBBF24", label: "ENDING", segmentType: 'straight' },
    { id: 12, x: -42, z: 220, color: "#FBBF24", label: "LOOP BACK", segmentType: 'straight' },
    { id: 13, x: -42, z: 155, color: "#FBBF24", label: "GO!", segmentType: 'straight' },
    { id: 14, x: -42, z: 90, color: "#FBBF24", label: "PUSH!", segmentType: 'straight' },
    { id: 15, x: -42, z: 20, color: "#FBBF24", label: "ALMOST", segmentType: 'straight', rotationOffset: -15 * (Math.PI / 180) },
    { id: 16, x: 0, z: 20, color: "#FBBF24", label: "FINISH", isFinal: true, segmentType: 'straight', rotationOffset: 5 * (Math.PI / 180) },
];

// --- COMPONENTS (Visuals) ---

function CheckpointGate({ position, rotation, status, color, isFinal, glowIntensity = 0 }: { position: [number, number, number], rotation: number, status: 'active' | 'next' | 'hidden' | 'completed', color: string, isFinal?: boolean, glowIntensity?: number }) {
    if (status === 'hidden' || status === 'completed') return null;
    const isActive = status === 'active';
    const width = 15;
    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <planeGeometry args={[width, isFinal ? 4 : 1.5]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 2 : 0.5} toneMapped={false} transparent opacity={isActive ? 0.9 : 0.4} side={THREE.DoubleSide} />
            </mesh>
            {isActive && (
                <>
                    <mesh position={[-width / 2, 2, 0]}><boxGeometry args={[0.3, 4, 0.3]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} /></mesh>
                    <mesh position={[width / 2, 2, 0]}><boxGeometry args={[0.3, 4, 0.3]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} /></mesh>
                </>
            )}
        </group>
    );
}

function VolumetricBeam({ position, rotation = [Math.PI / 2, 0, 0], scale = 1, color = "#fff5b6" }: { position: [number, number, number], rotation?: [number, number, number], scale?: number, color?: string }) {
    return (
        <mesh position={position} rotation={rotation as any}>
            <cylinderGeometry args={[0.1 * scale, 1.5 * scale, 6, 32, 1, true]} />
            <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    );
}

function SoftUnderglow({ width, length, color, intensity = 1 }: { width: number, length: number, color: string, intensity?: number }) {
    const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color(color) }, uOpacity: { value: intensity } }), [color, intensity]);
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[width, length]} />
            <shaderMaterial uniforms={uniforms} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`} fragmentShader={`uniform vec3 uColor;uniform float uOpacity;varying vec2 vUv;void main(){float dx=abs(vUv.x-0.5)*2.0;float dy=abs(vUv.y-0.5)*2.0;float alpha=(1.0-smoothstep(0.2,1.0,dx))*(1.0-smoothstep(0.2,1.0,dy));gl_FragColor=vec4(uColor,alpha*uOpacity);}`} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
    );
}

function GuideArrow({ position }: { position?: [number, number, number] }) {
    const arrowShape = useMemo(() => {
        const shape = new THREE.Shape();
        const w = 0.4; const l = 1.0; const hw = 0.8; const hl = 0.8;
        shape.moveTo(-w, 0); shape.lineTo(-w, l); shape.lineTo(-hw, l); shape.lineTo(0, l + hl); shape.lineTo(hw, l); shape.lineTo(w, l); shape.lineTo(w, 0); shape.lineTo(-w, 0);
        return shape;
    }, []);
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, Math.PI]} position={[0, 0, 3.5]}>
                <extrudeGeometry args={[arrowShape, { depth: 0.2, bevelEnabled: false }]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>
        </group>
    )
}

function RaceStartPad({ position }: { position: [number, number, number] }) {
    const group = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) group.current.rotation.y = t * 0.2;
        if (coreRef.current) { coreRef.current.rotation.x = t; coreRef.current.rotation.z = t * 0.5; coreRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.3; }
    });
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}><circleGeometry args={[5, 6]} /><meshBasicMaterial color="#F59E0B" transparent opacity={0.2} /></mesh>
            <group ref={group}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}><ringGeometry args={[4.5, 4.8, 6]} /><meshBasicMaterial color="#FBBF24" side={THREE.DoubleSide} /></mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} scale={0.8}><ringGeometry args={[4.5, 4.6, 6]} /><meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.5} /></mesh>
            </group>
            <mesh ref={coreRef} position={[0, 1.5, 0]}><octahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={4} wireframe /></mesh>
            <mesh position={[0, 1.5, 0]}><octahedronGeometry args={[0.5, 0]} /><meshBasicMaterial color="#ffffff" /></mesh>
            <Sparkles count={30} scale={[6, 4, 6]} size={4} speed={0.4} opacity={0.5} color="#FBBF24" position={[0, 2, 0]} />
            <mesh position={[0, 5, 0]}><cylinderGeometry args={[3.5, 3.5, 10, 6, 1, true]} /><meshStandardMaterial color="#FBBF24" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
            <Billboard position={[0, 4, 0]}><Text fontSize={1.5} color="#FFFFFF" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#F59E0B">START</Text></Billboard>
        </group>
    );
}

// --- CAR CONTROLLER (VELOCITAT I START PAD FIX) ---

function CarController({
    currentCheckpoint,
    setCurrentCheckpoint,
    setIsGameActive,
    isRaceActive,
    setIsRaceActive,
    onRaceFinish,
    isRaceFinished,
    resetToken,
    countdown,
    setCountdown,
    selectedCar,
    baseZoom
}: {
    currentCheckpoint: number,
    setCurrentCheckpoint: (idx: number) => void,
    setIsGameActive: (active: boolean) => void,
    isRaceActive: boolean,
    setIsRaceActive: (active: boolean) => void,
    onRaceFinish: () => void,
    isRaceFinished: boolean,
    resetToken: number,
    countdown: number | string | null,
    setCountdown: (val: number | string | null) => void,
    selectedCar: number,
    baseZoom: number
}) {
    const [ref, api] = useSphere(() => ({
        mass: 1,
        position: [7, 2, 0],
        args: [1],
        fixedRotation: true,
        // DAMPING MOLT BAIX (0.1) -> Perquè el cotxe no es freni sol tan ràpid.
        linearDamping: 0.10,
        // FRICCIÓ 0 -> Control total manual de la velocitat.
        material: { friction: 0.0, restitution: 0 }
    }));

    const chassisRef = useRef<THREE.Group>(null);
    const arrowRef = useRef<THREE.Group>(null);

    // Velocitat interna
    const currentSpeedRef = useRef(0);
    const velocity = useRef([0, 0, 0]);
    const positionRef = useRef([7, 2, 0]);
    const currentRotation = useRef(Math.PI);

    const [, getKeys] = useKeyboardControls<Controls>();
    const { viewport, camera } = useThree();
    const hasStarted = useRef(false);

    const gameActive = useRef(false);
    const lastDrivenPos = useRef(new THREE.Vector3(7, 2, 0));

    const trackData = useMemo(() => getTrackPoints(), []);

    useEffect(() => {
        const unsubVel = api.velocity.subscribe((v) => (velocity.current = v));
        const unsubPos = api.position.subscribe((p) => (positionRef.current = p));
        return () => { unsubVel(); unsubPos(); };
    }, [api.velocity, api.position]);

    // Reset Logic
    useEffect(() => {
        if (resetToken > 0) {
            gameActive.current = false;
            setIsGameActive(false);
            hasStarted.current = false;
            setCurrentCheckpoint(0);

            api.position.set(7, 2, 0);
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);
            currentSpeedRef.current = 0;

            currentRotation.current = Math.PI;
            if (chassisRef.current) chassisRef.current.rotation.y = Math.PI;
        }
    }, [resetToken, api.position, api.velocity, api.angularVelocity, setIsGameActive, setCurrentCheckpoint]);

    // Interaction Handlers
    useEffect(() => {
        const handleInteraction = () => {
            if (isRaceFinished) return;
            if (gameActive.current) {
                gameActive.current = false;
                setIsGameActive(false);
                setIsRaceActive(false);
                hasStarted.current = false;
                setCurrentCheckpoint(0);
            }
        };
        window.addEventListener('wheel', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        return () => {
            window.removeEventListener('wheel', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [setCurrentCheckpoint, setIsGameActive, setIsRaceActive, isRaceFinished]);

    const zToPixel = useRef(22);
    const FINAL_CHECKPOINT_Z = 230;

    useEffect(() => {
        const calculateScale = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const maxScroll = scrollHeight - viewportHeight;
            if (maxScroll > 0) {
                const ratio = maxScroll / (FINAL_CHECKPOINT_Z + 10);
                zToPixel.current = Math.max(ratio, 5);
            }
        };
        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    const timeStoppedOnPad = useRef(0);
    const RACE_PAD_POS = new THREE.Vector3(25, 0, 20);

    const startCountdownSequence = () => {
        api.position.set(0, 2, 20);
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
        currentSpeedRef.current = 0;
        currentRotation.current = -Math.PI / 2;
        if (chassisRef.current) chassisRef.current.rotation.y = -Math.PI / 2;
        setCountdown(3);
        let count = 3;
        const interval = setInterval(() => {
            count--;
            if (count > 0) setCountdown(count);
            else if (count === 0) setCountdown("GO!");
            else {
                clearInterval(interval);
                setCountdown(null);
                setIsRaceActive(true);
                setCurrentCheckpoint(1);
            }
        }, 1000);
    };

    const lastScrolledY = useRef(0);
    const timeAccumulator = useRef(0);
    const FIXED_TIME_STEP = 1 / 60;

    useFrame((state, delta) => {
        let { forward, back, left, right } = getKeys();

        if (isRaceFinished || countdown !== null) {
            forward = false; back = false; left = false; right = false;
        }

        const startDrift = getKeys().drift;

        // --- PARÀMETRES DE VELOCITAT (ARCADE) ---
        const MAX_SPEED = 90; // Velocitat màxima alta (abans 45)
        const ACCEL = 2.5; // Acceleració forta (abans 0.8)
        const STEER_SPEED = 0.035;
        const DRIFT_FACTOR = startDrift ? 0.98 : 0.92;
        const DRAG = 0.96;

        // 1. VISUALS (Sempre suaus)
        const pos = positionRef.current;
        const scrollY = pos[2] * zToPixel.current;
        const currentNativeScroll = window.scrollY;
        const scrollZ = currentNativeScroll / zToPixel.current;

        if (chassisRef.current) {
            chassisRef.current.rotation.order = 'YXZ';
            chassisRef.current.rotation.y = currentRotation.current;
            const tilt = (left ? 0.25 : 0) + (right ? -0.25 : 0);
            chassisRef.current.rotation.z = THREE.MathUtils.lerp(chassisRef.current.rotation.z, tilt, 0.1);
            const pitch = (forward ? -0.15 : 0) + (back ? 0.1 : 0);
            chassisRef.current.rotation.x = THREE.MathUtils.lerp(chassisRef.current.rotation.x, pitch, 0.1);
        }

        // Camera
        const targetZBase = gameActive.current ? pos[2] : scrollZ;
        if ((forward || back || left || right) && !isRaceFinished) {
            hasStarted.current = true;
        }
        const cinematicOffset = new THREE.Vector3(20, 5, 20);
        const gameplayOffset = new THREE.Vector3(0, 80, 50);
        const targetOffset = hasStarted.current ? gameplayOffset : cinematicOffset;
        const desiredX = hasStarted.current ? 0 : targetOffset.x + pos[0];
        const targetCamPos = new THREE.Vector3(desiredX, pos[1] + targetOffset.y, targetZBase + targetOffset.z);

        if (gameActive.current) state.camera.position.lerp(targetCamPos, 0.1);
        else state.camera.position.copy(targetCamPos);
        state.camera.lookAt(0, 0, targetZBase);

        // Zoom
        const targetZoom = hasStarted.current ? baseZoom : 75;
        if (state.camera instanceof THREE.OrthographicCamera) {
            state.camera.zoom = THREE.MathUtils.lerp(state.camera.zoom, targetZoom, 0.05);
            state.camera.updateProjectionMatrix();
        }

        if (arrowRef.current && isRaceActive && currentCheckpoint < CHECKPOINTS.length) {
            const target = CHECKPOINTS[currentCheckpoint];
            arrowRef.current.lookAt(target.x, pos[1], target.z);
        }

        // --- 2. LÓGICA DE FÍSICA ---
        timeAccumulator.current += delta;

        if (timeAccumulator.current >= FIXED_TIME_STEP) {
            timeAccumulator.current = 0;

            // LOGICA START PAD
            if (!isRaceActive && !countdown && !isRaceFinished) {
                // Calcular distancia manual (més fiable)
                const dx = pos[0] - RACE_PAD_POS.x;
                const dz = pos[2] - RACE_PAD_POS.z;
                const distSq = dx * dx + dz * dz;

                // Radi d'activació: 8 unitats (64 al quadrat)
                if (distSq < 64) {
                    timeStoppedOnPad.current = 0;
                    startCountdownSequence();
                }
            }

            // GESTIÓ VELOCITAT INTERNA
            let speed = currentSpeedRef.current;

            if (forward) speed += ACCEL;
            else if (back) speed -= ACCEL;
            else speed *= DRAG;

            speed = THREE.MathUtils.clamp(speed, -MAX_SPEED, MAX_SPEED);
            currentSpeedRef.current = speed;

            // GIRS
            const turnMultiplier = THREE.MathUtils.clamp(Math.abs(speed) / 5, 0, 1);
            if (left) currentRotation.current += STEER_SPEED * turnMultiplier;
            if (right) currentRotation.current -= STEER_SPEED * turnMultiplier;

            // VECTORS MOVIMENT
            const forwardVector = new THREE.Vector3(-Math.sin(currentRotation.current), 0, -Math.cos(currentRotation.current));
            const rightVector = new THREE.Vector3(-Math.sin(currentRotation.current + Math.PI / 2), 0, -Math.cos(currentRotation.current + Math.PI / 2));

            let forwardVelocity = forwardVector.multiplyScalar(speed);

            // APLICAR A FÍSICA
            api.velocity.set(forwardVelocity.x, velocity.current[1], forwardVelocity.z);

            // XOCS
            const realVelocityMagnitude = new THREE.Vector3(velocity.current[0], 0, velocity.current[2]).length();
            if (Math.abs(speed) > 5 && realVelocityMagnitude < 1) {
                currentSpeedRef.current *= 0.5;
            }

            // LIMITS MAPA
            const currentViewport = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 2, pos[2]));
            const visibleWidth = currentViewport.width;
            const maxX = (visibleWidth / 2) - 0.5;
            if (Math.abs(pos[0]) > maxX) {
                const clampedX = THREE.MathUtils.clamp(pos[0], -maxX, maxX);
                api.position.set(clampedX, pos[1], pos[2]);
                if ((pos[0] > 0 && velocity.current[0] > 0) || (pos[0] < 0 && velocity.current[0] < 0)) {
                    api.velocity.set(-velocity.current[0] * 0.5, velocity.current[1], velocity.current[2]);
                    currentSpeedRef.current *= 0.8;
                }
            }

            const MAP_MIN_Z = -5;
            const MAP_MAX_Z = 235;
            if (pos[2] < MAP_MIN_Z || pos[2] > MAP_MAX_Z) {
                const clampedZ = THREE.MathUtils.clamp(pos[2], MAP_MIN_Z, MAP_MAX_Z);
                api.position.set(pos[0], pos[1], clampedZ);
                if ((pos[2] <= MAP_MIN_Z && velocity.current[2] < 0) || (pos[2] >= MAP_MAX_Z && velocity.current[2] > 0)) {
                    api.velocity.set(velocity.current[0], velocity.current[1], -velocity.current[2] * 1.5);
                }
            }

            // ACTIVAR MODE JOC
            const isDriving = forward || back || left || right;
            if (isDriving && !gameActive.current && !isRaceFinished) {
                api.position.set(pos[0], 2, 0);
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(0, 0, 0);
                currentSpeedRef.current = 0;

                window.scrollTo({ top: 0, behavior: 'instant' });
                lastScrolledY.current = 0;
                gameActive.current = true;
                setIsGameActive(true);
                hasStarted.current = true;
            }

            // MODE CURSA
            if (gameActive.current) {
                document.body.style.overflow = 'hidden';
                lastDrivenPos.current.set(pos[0], 2, pos[2]);

                if (Math.abs(currentNativeScroll - scrollY) > 2) {
                    window.scrollTo(0, Math.max(0, scrollY));
                }

                if (isRaceActive && currentCheckpoint < CHECKPOINTS.length) {
                    const checkTrigger = (targetCpIndex: number) => {
                        const denseIdx = trackData.indices[targetCpIndex];
                        if (denseIdx === undefined || !trackData.points) return false;
                        const cpPos = trackData.points[denseIdx];
                        const len = trackData.points.length;
                        const prevP = trackData.points[(denseIdx - 1 + len) % len];
                        const nextP = trackData.points[(denseIdx + 1) % len];
                        const tangent = new THREE.Vector3().subVectors(nextP, prevP).normalize();
                        const carVec = new THREE.Vector3(pos[0], 0, pos[2]);
                        const toCar = new THREE.Vector3().subVectors(carVec, cpPos);
                        const distLong = toCar.dot(tangent);
                        const distLatVec = toCar.clone().sub(tangent.clone().multiplyScalar(distLong));
                        const distLat = distLatVec.length();
                        if (Math.abs(distLong) < 2.5 && distLat < 8) return true; // Incrementat hitbox
                        return false;
                    };

                    if (checkTrigger(currentCheckpoint)) {
                        if (currentCheckpoint === CHECKPOINTS.length - 1) onRaceFinish();
                        else setCurrentCheckpoint(currentCheckpoint + 1);
                    }
                }
            } else {
                document.body.style.overflow = 'auto';
                const START_POS = [7, 2, 0];
                const targetZ = scrollZ * 0.5;
                api.position.set(START_POS[0], START_POS[1], targetZ);
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(0, 0, 0);
                currentRotation.current = Math.PI;
                if (chassisRef.current) chassisRef.current.rotation.y = Math.PI;
                hasStarted.current = false;
            }
        }
    });

    return (
        <group ref={ref as any}>
            <group ref={chassisRef} position={[0, -0.4, 0]}>
                <CyberSportsCar variant={selectedCar} />
            </group>
            {gameActive.current && isRaceActive && currentCheckpoint < CHECKPOINTS.length && (
                <group ref={arrowRef} position={[0, 0.2, 0]}>
                    <GuideArrow />
                </group>
            )}
        </group>
    );
}

function Ground() {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        material: { friction: 0.1, restitution: 0 }
    }));

    return (
        <mesh ref={ref as any} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#020617" transparent opacity={0} />
        </mesh>
    );
}

function getTrackPoints() {
    const rawPoints: THREE.Vector3[] = [];
    const checkpointIndices: number[] = new Array(CHECKPOINTS.length).fill(0);

    for (let i = 0; i < CHECKPOINTS.length; i++) {
        const current = CHECKPOINTS[i];
        const next = CHECKPOINTS[(i + 1) % CHECKPOINTS.length];

        checkpointIndices[i] = rawPoints.length;
        rawPoints.push(new THREE.Vector3(current.x, 0.05, current.z));

        if (current.segmentType === 'straight') {
            const subdivisions = 5;
            for (let j = 1; j < subdivisions; j++) {
                const t = j / subdivisions;
                rawPoints.push(new THREE.Vector3(
                    THREE.MathUtils.lerp(current.x, next.x, t),
                    0.05,
                    THREE.MathUtils.lerp(current.z, next.z, t)
                ));
            }
        }
    }

    const points: THREE.Vector3[] = [];
    const finalIndices: number[] = new Array(CHECKPOINTS.length).fill(-1);
    const rawToNewIndex: number[] = new Array(rawPoints.length).fill(-1);

    for (let i = 0; i < rawPoints.length; i++) {
        const p = rawPoints[i];
        const nextIndex = (i + 1) % rawPoints.length;
        const nextP = rawPoints[nextIndex];

        if (p.distanceToSquared(nextP) > 0.0001) {
            rawToNewIndex[i] = points.length;
            points.push(p);
        }
    }

    for (let i = 0; i < CHECKPOINTS.length; i++) {
        const rawIdx = checkpointIndices[i];
        if (rawToNewIndex[rawIdx] !== -1) {
            finalIndices[i] = rawToNewIndex[rawIdx];
        } else {
            finalIndices[i] = 0;
        }
    }

    return { points, indices: finalIndices };
}

function CheckpointRenderer({ currentCheckpoint, theme }: { currentCheckpoint: number, theme?: string }) {
    const { points, indices } = useMemo(() => getTrackPoints(), []);

    if (!points || points.length === 0) return null;

    return (
        <>
            {CHECKPOINTS.map((cp, idx) => {
                let status: 'active' | 'next' | 'hidden' | 'completed' = 'hidden';
                if (idx < currentCheckpoint) status = 'completed';
                else if (idx === currentCheckpoint) status = 'active';
                else if (idx === currentCheckpoint + 1) status = 'next';

                const denseIdx = indices[idx];
                const len = points.length;
                const prevP = points[(denseIdx - 1 + len) % len];
                const nextP = points[(denseIdx + 1) % len];

                const dx = nextP.x - prevP.x;
                const dz = nextP.z - prevP.z;
                let angle = Math.atan2(dx, dz);

                if ((cp as any).rotationOffset) {
                    angle += (cp as any).rotationOffset;
                }

                let displayColor = (status === 'active') ? cp.color : "#334155";
                let glow = 0;

                if (status === 'active') {
                    displayColor = cp.color;
                    glow = 3;
                } else if (idx === currentCheckpoint + 1) {
                    displayColor = theme === 'light' ? "#000000" : "#FEF9C3";
                    glow = 2;
                } else {
                    displayColor = "#334155";
                    glow = 0;
                }

                return (
                    <CheckpointGate
                        key={cp.id}
                        position={[cp.x, 0, cp.z]}
                        rotation={angle}
                        color={displayColor}
                        status={status}
                        isFinal={cp.isFinal}
                        glowIntensity={glow}
                    />
                );
            })}
        </>
    );
}

// --- MAIN GAME ---

export function RacingGame({
    selectedCar = 0,
    onGameStateChange
}: {
    selectedCar?: number,
    onGameStateChange?: (active: boolean) => void
}) {
    const { resolvedTheme } = useTheme();
    const map = useMemo(() => [
        { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
        { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
        { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
        { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
        { name: Controls.drift, keys: ['Space'] },
        { name: Controls.reset, keys: ['KeyR'] },
    ], []);

    const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
    const [isGameActive, setIsGameActive] = useState(false);
    const [isRaceActive, setIsRaceActive] = useState(false);

    const [countdown, setCountdown] = useState<number | string | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [finishTime, setFinishTime] = useState<number | null>(null);
    const [resetToken, setResetToken] = useState(0);

    useEffect(() => {
        onGameStateChange?.(isGameActive);
    }, [isGameActive, onGameStateChange]);

    const resetRace = () => {
        setIsRaceActive(false);
        setStartTime(null);
        setFinishTime(null);
        setCurrentCheckpoint(0);
        setResetToken(prev => prev + 1);
    };

    const [zoom, setZoom] = useState(15);

    useEffect(() => {
        const handleResize = () => {
            const calculatedZoom = Math.min(15, window.innerWidth / 100);
            setZoom(calculatedZoom);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (

        <div className="fixed inset-0 z-50 pointer-events-none">
            <KeyboardControls map={map}>
                <Canvas
                    shadows={false}
                    dpr={[1, 1.5]}
                    gl={{ alpha: true, antialias: false }}
                    style={{ background: 'transparent', pointerEvents: 'none' }}
                >
                    {/* DEBUG: Monitor de rendimiento */}
                    <Stats showPanel={0} className="pointer-events-auto" />

                    <OrthographicCamera makeDefault position={[0, 50, 50]} zoom={zoom} near={-100} far={500} />

                    <ambientLight intensity={0.5} />
                    <directionalLight
                        position={[10, 50, 10]}
                        intensity={1.5}
                        color="#a5b4fc"
                        castShadow={false}
                    />

                    {/* --- FIX CRÍTICO: worker={null} --- */}
                    {/* @ts-ignore */}
                    <Physics gravity={[0, -20, 0]} stepSize={1 / 60} worker={null}>
                        <CarController
                            currentCheckpoint={currentCheckpoint}
                            setCurrentCheckpoint={setCurrentCheckpoint}
                            setIsGameActive={setIsGameActive}
                            isRaceActive={isRaceActive}
                            setIsRaceActive={(active) => {
                                setIsRaceActive(active);
                                if (active) {
                                    setStartTime(Date.now());
                                    setFinishTime(null);
                                }
                            }}
                            onRaceFinish={() => {
                                if (startTime) {
                                    setFinishTime(Date.now() - startTime);
                                    setIsRaceActive(false);
                                }
                            }}
                            isRaceFinished={!!finishTime}
                            resetToken={resetToken}
                            countdown={countdown}
                            setCountdown={setCountdown}
                            selectedCar={selectedCar}
                            baseZoom={zoom}
                        />
                        <Ground />
                        {isGameActive && !isRaceActive && !finishTime && !countdown && (
                            <RaceStartPad position={[25, 0, 20]} />
                        )}
                    </Physics>

                    {isGameActive && (isRaceActive || finishTime) && <CheckpointRenderer currentCheckpoint={currentCheckpoint} theme={resolvedTheme} />}

                    {countdown && (
                        <Html center wrapperClass="countdown-overlay" style={{ pointerEvents: 'none', zIndex: 100 }}>
                            <div style={{
                                fontSize: '12rem',
                                color: typeof countdown === 'string' ? '#22c55e' : 'white',
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                textShadow: '0 0 20px rgba(0,0,0,0.5)',
                                animation: 'pulse 0.5s ease-out'
                            }}>
                                {countdown}
                            </div>
                        </Html>
                    )}

                </Canvas>
            </KeyboardControls>

            {isGameActive && (
                <>
                    {isRaceActive && (
                        <div className="absolute top-4 right-4 z-10">
                            <RaceTimer isRunning={true} startTime={startTime} />
                        </div>
                    )}
                </>
            )}

            {isGameActive && (
                <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-white/50 text-xs font-mono">
                    PRESS 'R' TO RESET CAR | SCROLL TO EXIT
                </div>
            )}

            {isGameActive && finishTime && (
                <div className="pointer-events-auto">
                    <Leaderboard newTime={finishTime} onClose={resetRace} />
                </div>
            )}
        </div>
    );
}

// --- CAR VARIANTS DATA ---
export const CAR_VARIANTS = [
    { name: "Cyber Super", color: "#00aaff", accent: "#ffaa00", bodyStyle: "supercar" },
    { name: "Rally Evo", color: "#ef4444", accent: "#fbbf24", bodyStyle: "rally" },
    { name: "Unknown Tuner", color: "#a855f7", accent: "#22c55e", bodyStyle: "jdm" },
    { name: "Royal Phantom", color: "#171717", accent: "#9ca3af", bodyStyle: "rolls" },
    { name: "Titan 4x4", color: "#ffffff", accent: "#06b6d4", bodyStyle: "offroad" },
];

function CyberSportsCar({ variant = 0 }: { variant?: number }) {
    const { color, accent, bodyStyle } = CAR_VARIANTS[variant] || CAR_VARIANTS[0];
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <group rotation={[0, 0, 0]}>
            {bodyStyle === 'supercar' && (
                <>
                    <mesh position={[0, 0.35, 0]}>
                        <boxGeometry args={[1.9, 0.45, 4.1]} />
                        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.8, -0.1]}>
                        <boxGeometry args={[1.5, 0.5, 2.2]} />
                        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                    </mesh>

                    <group position={[0, 0.2, 2.0]}>
                        <mesh position={[0, 0, 0]}><boxGeometry args={[1.8, 0.2, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[-0.5, 0, 0]}><boxGeometry args={[0.1, 0.3, 0.3]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[0.5, 0, 0]}><boxGeometry args={[0.1, 0.3, 0.3]} /><meshStandardMaterial color="#111" /></mesh>
                    </group>

                    <mesh position={[0.96, 0.4, 0.5]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.1, 0.3, 1.2]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[-0.96, 0.4, 0.5]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.1, 0.3, 1.2]} /><meshStandardMaterial color="#111" /></mesh>

                    <group position={[0, 0.6, 1.8]}>
                        <mesh position={[0, 0.3, 0]}><boxGeometry args={[2.2, 0.05, 0.6]} /><meshStandardMaterial color={accent} /></mesh>
                        <mesh position={[-0.8, 0.02, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.1, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[0.8, 0.02, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.1, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                    </group>

                    <mesh position={[-0.7, 0.45, -2.06]} rotation={[0, 0.2, 0]}> <boxGeometry args={[0.5, 0.1, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.7, 0.45, -2.06]} rotation={[0, -0.2, 0]}> <boxGeometry args={[0.5, 0.1, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>

                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.7, 0.45, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.7, 0.45, -5]} rotation={[Math.PI / 2, 0, 0]} />
                        </>
                    )}

                    <mesh position={[0, 0.5, 2.01]}> <boxGeometry args={[1.7, 0.1, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {bodyStyle === 'rally' && (
                <>
                    <mesh position={[0, 0.45, 0]}>
                        <boxGeometry args={[1.75, 0.65, 3.9]} />
                        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 0.95, 0.3]}>
                        <boxGeometry args={[1.55, 0.65, 1.8]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, 1.3, -0.4]}>
                        <boxGeometry args={[0.5, 0.15, 0.5]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    <mesh position={[-0.5, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>
                    <mesh position={[-0.25, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>
                    <mesh position={[0.25, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>
                    <mesh position={[0.5, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>

                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.5, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                            <VolumetricBeam position={[-0.25, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                            <VolumetricBeam position={[0.25, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                            <VolumetricBeam position={[0.5, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                        </>
                    )}

                    <mesh position={[-0.7, 0.2, 1.3]}><boxGeometry args={[0.4, 0.3, 0.05]} /><meshStandardMaterial color={accent} /></mesh>
                    <mesh position={[0.7, 0.2, 1.3]}><boxGeometry args={[0.4, 0.3, 0.05]} /><meshStandardMaterial color={accent} /></mesh>

                    <group position={[0, 1.25, 1.7]}>
                        <mesh position={[0, 0, 0]}><boxGeometry args={[1.6, 0.05, 0.4]} /><meshStandardMaterial color={accent} /></mesh>
                        <mesh position={[-0.8, -0.2, 0.1]}><boxGeometry args={[0.05, 0.5, 0.5]} /><meshStandardMaterial color={accent} /></mesh>
                        <mesh position={[0.8, -0.2, 0.1]}><boxGeometry args={[0.05, 0.5, 0.5]} /><meshStandardMaterial color={accent} /></mesh>
                    </group>

                    <mesh position={[-0.7, 0.6, 1.96]}> <boxGeometry args={[0.3, 0.3, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.7, 0.6, 1.96]}> <boxGeometry args={[0.3, 0.3, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {bodyStyle === 'jdm' && (
                <>
                    <mesh position={[0, 0.4, 0]}>
                        <boxGeometry args={[1.8, 0.55, 4.1]} />
                        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.9, -0.2]}>
                        <boxGeometry args={[1.6, 0.6, 2.0]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    <mesh position={[0.95, 0.35, 1.2]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[-0.95, 0.35, 1.2]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0.95, 0.35, -1.2]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[-0.95, 0.35, -1.2]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>

                    <mesh position={[0.6, 0.25, 2.1]} rotation={[0.4, 0.2, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                        <meshStandardMaterial color="#aaa" metalness={1} roughness={0.2} />
                    </mesh>

                    <group position={[0, 0.45, 1.85]}>
                        <mesh position={[-0.8, 0.3, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.2, 0.6, 0.4]} /><meshStandardMaterial color={color} /></mesh>
                        <mesh position={[0.8, 0.3, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.2, 0.6, 0.4]} /><meshStandardMaterial color={color} /></mesh>
                        <mesh position={[0, 0.65, -0.1]}><boxGeometry args={[1.9, 0.1, 0.5]} /><meshStandardMaterial color={color} /></mesh>
                    </group>

                    <mesh position={[-0.6, 0.5, -2.06]} rotation={[0, 0, -0.15]}> <boxGeometry args={[0.5, 0.15, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.6, 0.5, -2.06]} rotation={[0, 0, 0.15]}> <boxGeometry args={[0.5, 0.15, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>

                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.6, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.6, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <SoftUnderglow width={2.2} length={4.2} color="#f000ff" intensity={1.2} />
                        </>
                    )}

                    <mesh position={[-0.5, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[-0.8, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.5, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.8, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {bodyStyle === 'rolls' && (
                <>
                    <mesh position={[0, 0.55, 0]}>
                        <boxGeometry args={[1.9, 0.85, 4.6]} />
                        <meshStandardMaterial color={color} metalness={0.2} roughness={0.1} />
                        <Edges threshold={15} color="#444" />
                    </mesh>
                    <mesh position={[0, 1.0, -1.0]}>
                        <boxGeometry args={[1.4, 0.02, 2.0]} />
                        <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.2} />
                    </mesh>

                    <mesh position={[0, 1.15, 0.6]}>
                        <boxGeometry args={[1.8, 0.65, 2.4]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    <mesh position={[0, 0.65, -2.31]}>
                        <boxGeometry args={[1.0, 0.9, 0.1]} />
                        <meshStandardMaterial color="#e5e5e5" metalness={1} roughness={0} />
                    </mesh>
                    {[...Array(5)].map((_, i) => (
                        <mesh key={i} position={[(i - 2) * 0.15, 0.65, -2.36]}>
                            <boxGeometry args={[0.05, 0.85, 0.05]} />
                            <meshStandardMaterial color="#333" />
                        </mesh>
                    ))}

                    <mesh position={[0, 1.05, -2.25]}>
                        <octahedronGeometry args={[0.1, 0]} />
                        <meshStandardMaterial color="gold" metalness={1} roughness={0} />
                    </mesh>

                    <mesh position={[-0.7, 0.7, -2.31]}> <boxGeometry args={[0.3, 0.2, 0.1]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.7, 0.7, -2.31]}> <boxGeometry args={[0.3, 0.2, 0.1]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>

                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.7, 0.7, -5.3]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.7, 0.7, -5.3]} rotation={[Math.PI / 2, 0, 0]} />
                        </>
                    )}

                    <mesh position={[-0.8, 0.7, 2.31]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.8, 0.7, 2.31]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {bodyStyle === 'offroad' && (
                <group position={[0, 0.25, 0]}>
                    <mesh position={[0, 0.7, 0]}>
                        <boxGeometry args={[1.9, 0.9, 3.8]} />
                        <meshStandardMaterial color={color} roughness={0.7} />
                    </mesh>
                    <mesh position={[0, 1.45, -0.2]}>
                        <boxGeometry args={[1.7, 0.7, 2.2]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    <mesh position={[0, 0.6, -2.0]}>
                        <boxGeometry args={[1.6, 0.4, 0.1]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[0, 0.9, -1.95]} rotation={[0.2, 0, 0]}>
                        <boxGeometry args={[1.2, 0.4, 0.1]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>

                    <mesh position={[0, 0.8, 2.0]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 0.35, 16]} />
                        <meshStandardMaterial color="#1f2937" />
                    </mesh>

                    <group position={[0, 1.82, -1.0]}>
                        <mesh><boxGeometry args={[1.3, 0.1, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[-0.5, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                        <mesh position={[-0.17, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                        <mesh position={[0.17, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                        <mesh position={[0.5, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                    </group>

                    <mesh position={[-0.6, 0.8, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.6, 0.8, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>

                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.6, 0.8, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.6, 0.8, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[-0.5, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                            <VolumetricBeam position={[-0.17, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                            <VolumetricBeam position={[0.17, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                            <VolumetricBeam position={[0.5, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                        </>
                    )}

                    <mesh position={[-0.85, 0.8, 1.91]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.85, 0.8, 1.91]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </group>
            )}

            <group position={[0, bodyStyle === 'offroad' ? -0.1 : 0, 0]}>
                <Wheel position={[-0.95, 0.35, 1.2]} scale={bodyStyle === 'offroad' ? 1.3 : 1} rimColor={bodyStyle === 'rolls' ? '#silver' : undefined} />
                <Wheel position={[0.95, 0.35, 1.2]} scale={bodyStyle === 'offroad' ? 1.3 : 1} rimColor={bodyStyle === 'rolls' ? '#silver' : undefined} />
                <Wheel position={[-0.95, 0.35, -1.3]} scale={bodyStyle === 'offroad' ? 1.3 : 1} rimColor={bodyStyle === 'rolls' ? '#silver' : undefined} />
                <Wheel position={[0.95, 0.35, -1.3]} scale={bodyStyle === 'offroad' ? 1.3 : 1} rimColor={bodyStyle === 'rolls' ? '#silver' : undefined} />
            </group>
        </group>
    );
}

function Wheel({ position, rimColor = "#9ca3af", scale = 1 }: { position: [number, number, number], rimColor?: string, scale?: number }) {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.35, 0.35, 0.5, 24]} />
                <meshStandardMaterial color="#1f2937" roughness={0.8} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.52, 16]} />
                <meshStandardMaterial color={rimColor} metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    )
}