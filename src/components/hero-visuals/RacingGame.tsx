"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import { PerspectiveCamera, OrthographicCamera, useKeyboardControls, KeyboardControls, Billboard, Text, Html, Sparkles, Edges } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";

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
// Positioned along the track to guide user through content sections
// Coordinates are explicit (X, Z) to support winding paths/loops.
const CHECKPOINTS = [
    { id: 0, x: 0, z: 20, color: "#FBBF24", label: "START", segmentType: 'straight' },           // 1. Top Center -> Top Right
    { id: 1, x: 28, z: 30, color: "#FBBF24", label: "ABOUT", segmentType: 'curve' },             // 2. Top Right Corner (Turn)
    { id: 2, x: 28, z: 80, color: "#FBBF24", label: "SKILLS", segmentType: 'straight', rotationOffset: -30 * (Math.PI / 180) }, // 3. Right Straight
    { id: 3, x: 5, z: 80, color: "#FBBF24", label: "PROJECTS 1", segmentType: 'curve' },         // 4. Center Turn
    { id: 4, x: -12, z: 50, color: "#FBBF24", label: "PROJECTS 2", segmentType: 'curve' },       // 5. Loop Top Inner
    { id: 5, x: -18, z: 90, color: "#FBBF24", label: "CONTACT", segmentType: 'curve' },          // 6. Left Inner Down
    { id: 6, x: 20, z: 120, color: "#FBBF24", label: "EXP 1", segmentType: 'curve' },            // 7. Right Cross
    { id: 7, x: -12, z: 150, color: "#FBBF24", label: "EXP 2", segmentType: 'curve' },           // 8. Left Zig
    { id: 8, x: 0, z: 170, color: "#FBBF24", label: "EXP 3", segmentType: 'curve' },             // 9. Center Zag
    { id: 9, x: 20, z: 165, color: "#FBBF24", label: "MISC", segmentType: 'curve' },             // 10. Loop Twist
    { id: 10, x: 28, z: 220, color: "#FBBF24", label: "SOCIALS", segmentType: 'straight', rotationOffset: -45 * (Math.PI / 180) },      // 11. Bottom Right Corner -> Bottom Center
    { id: 11, x: 0, z: 225, color: "#FBBF24", label: "ENDING", segmentType: 'straight' },        // 12. Bottom Center -> Bottom Left
    { id: 12, x: -42, z: 220, color: "#FBBF24", label: "LOOP BACK", segmentType: 'straight' },   // 13. Bottom Left Corner -> Top Left (Long Straight)
    { id: 13, x: -42, z: 155, color: "#FBBF24", label: "GO!", segmentType: 'straight' },         // 14. Intermediate 1
    { id: 14, x: -42, z: 90, color: "#FBBF24", label: "PUSH!", segmentType: 'straight' },        // 15. Intermediate 2
    { id: 15, x: -42, z: 20, color: "#FBBF24", label: "ALMOST", segmentType: 'straight', rotationOffset: -15 * (Math.PI / 180) },       // 16. Top Left Corner
    { id: 16, x: 0, z: 20, color: "#FBBF24", label: "FINISH", isFinal: true, segmentType: 'straight', rotationOffset: 5 * (Math.PI / 180) }, // 17. Finish
];

// --- COMPONENTS ---

// --- CHECKPOINT GATE VISUAL (2D LINE STYLE) ---
// --- CHECKPOINT GATE VISUAL (2D LINE STYLE) ---
function CheckpointGate({ position, rotation, status, color, isFinal, glowIntensity = 0 }: { position: [number, number, number], rotation: number, status: 'active' | 'next' | 'hidden' | 'completed', color: string, isFinal?: boolean, glowIntensity?: number }) {
    if (status === 'hidden' || status === 'completed') return null;

    const isActive = status === 'active';
    const width = 15; // Increased to ensure full track coverage

    return (
        <group position={[position[0], 0, position[2]]} rotation={[0, rotation, 0]}>
            {/* The Bar Itself (Laid Flat on Road) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}> {/* Lifted slightly more to 0.1 */}
                <planeGeometry args={[width, isFinal ? 4 : 1.5]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isActive ? 2 : 0.5}
                    toneMapped={false}
                    transparent
                    opacity={isActive ? 0.9 : 0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Markers (Vertical Posts on sides) */}
            {isActive && (
                <>
                    <mesh position={[-width / 2, 2, 0]}>
                        <boxGeometry args={[0.3, 4, 0.3]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[width / 2, 2, 0]}>
                        <boxGeometry args={[0.3, 4, 0.3]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
                    </mesh>
                </>
            )}
        </group>
    );
}

// --- VOLUMETRIC BEAM COMPONENT ---
function VolumetricBeam({ position, rotation = [Math.PI / 2, 0, 0], scale = 1, color = "#fff5b6" }: { position: [number, number, number], rotation?: [number, number, number], scale?: number, color?: string }) {
    return (
        <mesh position={position} rotation={rotation}>
            {/* Cone: RadiusTop, RadiusBottom, Height, Segments */}
            {/* Shortened from 10 to 6 */}
            <cylinderGeometry args={[0.1 * scale, 1.5 * scale, 6, 32, 1, true]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.15}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}



// --- SOFT UNDERGLOW COMPONENT ---
function SoftUnderglow({ width, length, color, intensity = 1 }: { width: number, length: number, color: string, intensity?: number }) {
    const uniforms = useMemo(() => ({
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: intensity }
    }), [color, intensity]);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[width, length]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform vec3 uColor;
                    uniform float uOpacity;
                    varying vec2 vUv;
                    void main() {
                        float dx = abs(vUv.x - 0.5) * 2.0;
                        float dy = abs(vUv.y - 0.5) * 2.0;
                        float alpha = (1.0 - smoothstep(0.2, 1.0, dx)) * (1.0 - smoothstep(0.2, 1.0, dy));
                        gl_FragColor = vec4(uColor, alpha * uOpacity);
                    }
                `}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// --- GUIDE ARROW ---
function GuideArrow({ position }: { position?: [number, number, number] }) {
    const arrowShape = useMemo(() => {
        const shape = new THREE.Shape();
        // Draw Arrow pointing UP
        const w = 0.4;
        const l = 1.0;
        const hw = 0.8;
        const hl = 0.8;

        shape.moveTo(-w, 0);
        shape.lineTo(-w, l);
        shape.lineTo(-hw, l);
        shape.lineTo(0, l + hl);
        shape.lineTo(hw, l);
        shape.lineTo(w, l);
        shape.lineTo(w, 0);
        shape.lineTo(-w, 0);

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

// --- RACE START PAD ---
// --- RACE START PAD ---
function RaceStartPad({ position }: { position: [number, number, number] }) {
    const group = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.rotation.y = t * 0.2;
        }
        if (coreRef.current) {
            coreRef.current.rotation.x = t;
            coreRef.current.rotation.z = t * 0.5;
            coreRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.3;
        }
    });

    return (
        <group position={position}>
            {/* Ground Hexagon Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <circleGeometry args={[5, 6]} />
                <meshBasicMaterial color="#F59E0B" transparent opacity={0.2} />
            </mesh>

            {/* Rotating Rings */}
            <group ref={group}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                    <ringGeometry args={[4.5, 4.8, 6]} />
                    <meshBasicMaterial color="#FBBF24" side={THREE.DoubleSide} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} scale={0.8}>
                    <ringGeometry args={[4.5, 4.6, 6]} />
                    <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.5} />
                </mesh>
            </group>

            {/* Core Energy Crystal */}
            <mesh ref={coreRef} position={[0, 1.5, 0]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color="#FBBF24"
                    emissive="#F59E0B"
                    emissiveIntensity={4}
                    wireframe
                />
            </mesh>

            {/* Inner Core Solid */}
            <mesh position={[0, 1.5, 0]}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Rising Particles */}
            <Sparkles
                count={30}
                scale={[6, 4, 6]}
                size={4}
                speed={0.4}
                opacity={0.5}
                color="#FBBF24"
                position={[0, 2, 0]}
            />

            {/* Vertical Beam */}
            <mesh position={[0, 5, 0]}>
                <cylinderGeometry args={[3.5, 3.5, 10, 6, 1, true]} />
                <meshStandardMaterial
                    color="#FBBF24"
                    transparent
                    opacity={0.05}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Floating Text */}
            <Billboard position={[0, 4, 0]}>
                <Text
                    fontSize={1.5}
                    color="#FFFFFF"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#F59E0B"
                >
                    START
                </Text>
            </Billboard>
        </group>
    );
}

// ... (Skipping CarController to keep diff small if possible, or just targeting Renderer if I can jump)
// Actually I need to jump to CheckpointRenderer at the end of the file.
// I will do two separate replaces to be clean.


function CarController({
    setDebugInfo,
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
    setDebugInfo: (info: any) => void,
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
    // 1. PHYSICS
    const [ref, api] = useSphere(() => ({
        mass: 1,
        position: [7, 2, 0], // Start Right Side (Adjusted per request)
        args: [1],
        fixedRotation: true,
        linearDamping: 0.8, // More damping for tighter control
        material: { friction: 0.0, restitution: 0 }
    }));

    // Visual Child Ref
    const chassisRef = useRef<THREE.Group>(null);
    const arrowRef = useRef<THREE.Group>(null); // NEW: Arrow Ref

    // State
    const velocity = useRef([0, 0, 0]);
    const positionRef = useRef([7, 2, 0]); // Initialized to car's start position
    const currentRotation = useRef(Math.PI); // Face Down (+Z) by default

    const [, getKeys] = useKeyboardControls<Controls>();
    const { viewport, camera } = useThree(); // Get camera
    const hasStarted = useRef(false); // Track if user has started driving

    // Game State:
    // gameActive: True when user is driving (disables page scroll).
    // isRaceActive: True when race logic is running (Timer, Checkpoints).
    const gameActive = useRef(false);
    const lastDrivenPos = useRef(new THREE.Vector3(7, 2, 0));

    // Get Track Data for Physics/Hitboxes
    const trackData = useMemo(() => getTrackPoints(), []);

    useEffect(() => {
        const unsubVel = api.velocity.subscribe((v) => (velocity.current = v));
        const unsubPos = api.position.subscribe((p) => (positionRef.current = p));
        return () => { unsubVel(); unsubPos(); };
    }, [api.velocity, api.position]);

    // --- FORCE RESET HANDLER ---
    // Handle explicit resets (e.g., from Leaderboard or 'R' key).
    // Teleports car to start and zeros out all physics velocities.
    useEffect(() => {
        if (resetToken > 0) {
            gameActive.current = false;
            setIsGameActive(false);
            hasStarted.current = false;
            setCurrentCheckpoint(0);

            api.position.set(7, 2, 0);
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);

            currentRotation.current = Math.PI;
            if (chassisRef.current) chassisRef.current.rotation.y = Math.PI;
        }
    }, [resetToken, api.position, api.velocity, api.angularVelocity, setIsGameActive, setCurrentCheckpoint]);

    // --- RESET ON INTERACTION ---
    useEffect(() => {
        const handleInteraction = () => {
            // CRITICAL FIX: Do NOT reset if the race is finished (Leaderboard is open)
            // We want the user to interact with the UI, not reset the game logic immediately.
            if (isRaceFinished) return;

            if (gameActive.current) {
                gameActive.current = false;
                setIsGameActive(false); // Sync State
                setIsRaceActive(false); // Exiting clears race mode
                hasStarted.current = false; // Reset cinematic view logic
                setCurrentCheckpoint(0); // Reset checkpoints logic
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

    // Dynamic Track Scaling
    const zToPixel = useRef(22); // Default fallback
    const FINAL_CHECKPOINT_Z = 230; // Updated to match Checkpoint 11 (Ending) depth

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

    // Countdown state lifted to parent
    const timeStoppedOnPad = useRef(0);
    const RACE_PAD_POS = new THREE.Vector3(25, 0, 20); // Moved Further Right (18 -> 25)

    // --- COUNTDOWN SEQUENCE ---
    const startCountdownSequence = () => {
        // 1. Reset Position to Start
        // We set to 0,0,20 but maybe 0,2,20 to be safe above ground
        api.position.set(0, 2, 20);
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);

        // ROTATION: 90 degrees Left (from Face Down) = Face East (-PI/2)
        // Face Down is PI. Left turn is -PI/2.
        currentRotation.current = -Math.PI / 2; // Face East
        if (chassisRef.current) chassisRef.current.rotation.y = -Math.PI / 2;

        // 2. Start Countdown
        setCountdown(3);

        // Use a recursive timeout or interval handled by effect? 
        // Simple interval is risky in component if not cleared on unmount, but for short burst it's ok.
        // Better: Timer in a useEffect dependant on 'countdown' state? 
        // Stick to simple for now, but use refs for safety if needed.
        let count = 3;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                setCountdown(count);
            } else if (count === 0) {
                setCountdown("GO!");
            } else {
                clearInterval(interval);
                setCountdown(null);
                setIsRaceActive(true);
                setCurrentCheckpoint(1);
            }
        }, 1000);
    };

    useFrame((state, delta) => {
        // ... (Existing Key Logic)
        let { forward, back, left, right, reset } = getKeys();

        // DISABLE INPUTS IF RACE FINISHED OR DURING COUNTDOWN
        if (isRaceFinished || countdown !== null) {
            forward = false;
            back = false;
            left = false;
            right = false;
            reset = false;
        }

        const startDrift = getKeys().drift;

        // ... (Physics Constants)
        const MAX_SPEED = 35;
        const ACCEL = 0.8;
        const STEER_SPEED = 0.025;
        const DRIFT_FACTOR = startDrift ? 0.985 : 0.90; // Drift = slippery (0.985), Normal = Grippy (0.90)
        const DRAG = 0.92;

        // Calc Speed
        const currentVel = new THREE.Vector3(velocity.current[0], 0, velocity.current[2]);
        const speed = currentVel.length();

        // --- RACE START PAD LOGIC ---
        // Only active if game not active (Free Roam) and not already counting down
        if (!isRaceActive && !countdown && !isRaceFinished) {
            const distToPad = positionRef.current && RACE_PAD_POS.distanceTo(new THREE.Vector3(positionRef.current[0], 0, positionRef.current[2]));

            // Check if on Pad (< 4 units) and Slow enough (< 5 speed = nearly stopping)
            // No wait time for activation
            if (distToPad < 4) {
                // INSTANT TRIGGER (No Wait)
                timeStoppedOnPad.current = 0;
                startCountdownSequence();
            }
        }

        // ... (Steering and Movement Logic)


        // Steering: Attenuate steering at low speeds to prevent pivoting in place
        const turnMultiplier = THREE.MathUtils.clamp(speed / 8, 0, 1);
        if (left) currentRotation.current += STEER_SPEED * turnMultiplier;
        if (right) currentRotation.current -= STEER_SPEED * turnMultiplier;

        // Force Vectors
        const forwardVector = new THREE.Vector3(
            -Math.sin(currentRotation.current), 0, -Math.cos(currentRotation.current)
        );
        const rightVector = new THREE.Vector3(
            -Math.sin(currentRotation.current + Math.PI / 2), 0, -Math.cos(currentRotation.current + Math.PI / 2)
        );

        // Decompose
        let forwardSpeed = currentVel.dot(forwardVector);
        let sideSpeed = currentVel.dot(rightVector);

        // Input
        if (forward) forwardSpeed += ACCEL;
        else if (back) forwardSpeed -= ACCEL;
        else forwardSpeed *= DRAG;

        forwardSpeed = THREE.MathUtils.clamp(forwardSpeed, -MAX_SPEED, MAX_SPEED);
        sideSpeed *= DRIFT_FACTOR;

        // Apply Drift: Combine forward velocity with lateral slide
        const newVel = forwardVector.multiplyScalar(forwardSpeed).add(rightVector.multiplyScalar(sideSpeed));

        // Apply Velocity
        api.velocity.set(newVel.x, velocity.current[1], newVel.z);


        // --- 2. CONSTRAINTS & SCROLL SYNC ---
        const pos = positionRef.current;

        // X CONSTRAINT (Screen Edges) ... [Removed logic for simplicity in diff, keeping core physics]
        // [Existing Clamp X Logic Here] - Re-implementing simplified to be safe
        // Dynamic Viewport Constraint: Keep car within visible bounds of the orthographic camera
        const currentViewport = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 2, pos[2]));
        const visibleWidth = currentViewport.width;
        const SIDE_MARGIN = 0.5;
        const maxX = (visibleWidth / 2) - SIDE_MARGIN;

        // Bouncing off walls (X-Axis)
        if (Math.abs(pos[0]) > maxX) {
            const clampedX = THREE.MathUtils.clamp(pos[0], -maxX, maxX);
            api.position.set(clampedX, pos[1], pos[2]);
            if ((pos[0] > 0 && velocity.current[0] > 0) || (pos[0] < 0 && velocity.current[0] < 0)) {
                api.velocity.set(-velocity.current[0] * 0.6, velocity.current[1], velocity.current[2]);
            }
        }

        // Z CONSTRAINT (Global Map Limits)
        // Prevent driving into the void. Map is roughly 0 to 230.

        const MAP_MIN_Z = -5;
        const MAP_MAX_Z = 235;

        // Bouncing off top/bottom (Z-Axis Global)
        if (pos[2] < MAP_MIN_Z || pos[2] > MAP_MAX_Z) {
            const clampedZ = THREE.MathUtils.clamp(pos[2], MAP_MIN_Z, MAP_MAX_Z);
            api.position.set(pos[0], pos[1], clampedZ);

            // Reverse Z Velocity if moving outwards
            // Increased bounce factor to 1.2 for visible effect
            if ((pos[2] <= MAP_MIN_Z && velocity.current[2] < 0) || (pos[2] >= MAP_MAX_Z && velocity.current[2] > 0)) {
                api.velocity.set(velocity.current[0], velocity.current[1], -velocity.current[2] * 1.5);
            }
        }

        // Z -> SCROLL MAPPING
        // Use Dynamic Ratio
        const scrollY = pos[2] * zToPixel.current;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        // recalculate maxZ based on current ratio to keep physics consistent
        const maxZ = maxScroll / zToPixel.current;

        // Sync Window Scroll (Hybrid Logic)
        // 1. DRIVING MODE: If user is driving (WASD), Car controls Scroll.
        const isDriving = forward || back || left || right;
        const currentNativeScroll = window.scrollY;
        const scrollZ = currentNativeScroll / zToPixel.current;

        // --- GAME MODE ACTIVATION STATE MACHINE ---
        // ACTIVATION: WASD Keys
        if (isDriving && !gameActive.current && !isRaceFinished) {

            // Auto Scroll to Top on WASD Start
            // 1. Teleport Car to Start (Top of page) to sync with Scroll=0
            api.position.set(pos[0], 2, 0);
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);

            // 2. Reset Scroll immediately
            window.scrollTo({ top: 0, behavior: 'instant' }); // Instant to prevent fighting with physics loop

            gameActive.current = true;
            setIsGameActive(true); // Sync State
            hasStarted.current = true;
            // Teleport car to start if needed? No, let them drive from wherever or reset
        }

        // Apply Mode Effects
        if (gameActive.current) {
            // --- ACTIVE GAME MODE ---
            // "Stop the Web": Disable native scrolling
            document.body.style.overflow = 'hidden';

            // Update Last Known Pos
            lastDrivenPos.current.set(pos[0], 2, pos[2]);

            // Sync Page Scroll to Car Z position when driving
            // Sync Page Scroll to Car Z position when driving
            window.scrollTo(0, Math.max(0, scrollY));

            // --- CHECKPOINT / START GATE LOGIC (PRECISE OBB) ---

            // Logic Handler for triggers
            const checkTrigger = (targetCpIndex: number, isStartGate: boolean) => {
                const denseIdx = trackData.indices[targetCpIndex];
                if (denseIdx === undefined || !trackData.points) return false;

                const cpPos = trackData.points[denseIdx];
                const len = trackData.points.length;

                // Calculate Tangent (Track Direction) for Normal Plane
                const prevP = trackData.points[(denseIdx - 1 + len) % len];
                const nextP = trackData.points[(denseIdx + 1) % len];
                const tangent = new THREE.Vector3().subVectors(nextP, prevP).normalize();

                const carVec = new THREE.Vector3(pos[0], 0, pos[2]);
                const toCar = new THREE.Vector3().subVectors(carVec, cpPos);

                // 1. Longitudinal Distance (Along Track) - "Depth" of hitbox
                const distLong = toCar.dot(tangent);

                // 2. Lateral Distance (Across Track) - "Width" of hitbox
                const distLatVec = toCar.clone().sub(tangent.clone().multiplyScalar(distLong));
                const distLat = distLatVec.length();

                // HITBOX: 
                // Depth: +/- 1.2 units (2.4 unit thick line)
                // Width: < 7.5 units (Matches visual width of 15)
                if (Math.abs(distLong) < 1.2 && distLat < 8) {
                    return true;
                }
                return false;
            };

            if (isRaceActive) {
                // RACE MODE: Trigger Checkpoints
                if (currentCheckpoint < CHECKPOINTS.length) {
                    if (checkTrigger(currentCheckpoint, false)) {
                        // Check collision with final checkpoint
                        if (currentCheckpoint === CHECKPOINTS.length - 1) {
                            onRaceFinish(); // Trigger finish logic in Parent
                        } else {
                            // Advance
                            setCurrentCheckpoint(currentCheckpoint + 1);
                        }
                    }
                }
            }
            // OLD START GATE LOGIC REMOVED (Replaced by Pad Detection)

        } else {
            // --- PASSIVE web MODE ---
            // Reset triggered by Mouse/Scroll interaction.
            document.body.style.overflow = 'auto'; // Ensure scrollable

            // PARALLAX DRIVING EFFECT
            // Car moves Forward (+Z) as user scrolls, but slower than page.
            // Result: Car visually "drives" down the track while scrolling up the screen.
            const START_POS = [7, 2, 0];
            const targetZ = scrollZ * 0.5;

            api.position.set(START_POS[0], START_POS[1], targetZ);
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);

            // Reset Rotation (Face Forward)
            currentRotation.current = Math.PI;
            if (chassisRef.current) chassisRef.current.rotation.y = Math.PI;

            hasStarted.current = false;
        }

        // Removed Z-Clamp for GameMode to allow loops (going up/down freely)

        // --- 3. CAMERA SYNC ---
        // Camera Z follows Car Z (Active) OR Scroll Z (Passive)
        // If Game Active: Camera Follows Car
        // If Passive: Camera tracks Scroll (Car is at Start, but we view where we scroll)
        const targetZBase = gameActive.current ? pos[2] : scrollZ;

        // Dynamic Camera Transition Logic
        if ((forward || back || left || right) && !isRaceFinished) {
            hasStarted.current = true;
        }

        // 1. Cinematic Start
        const cinematicOffset = new THREE.Vector3(20, 5, 20);

        // 2. Gameplay: High Angle, Center View
        const gameplayOffset = new THREE.Vector3(0, 80, 50);

        // Camera Logic:
        // - Game Mode: Lerp smoothly to follow car.
        // - Web Mode: Snap instantly to scroll position to prevent jitter.
        const targetOffset = hasStarted.current ? gameplayOffset : cinematicOffset;
        const desiredX = hasStarted.current ? 0 : targetOffset.x + pos[0];

        const targetCamPos = new THREE.Vector3(
            desiredX,
            pos[1] + targetOffset.y,
            targetZBase + targetOffset.z
        );

        if (gameActive.current) {
            state.camera.position.lerp(targetCamPos, 0.1);
        } else {
            state.camera.position.copy(targetCamPos);
        }
        state.camera.lookAt(0, 0, targetZBase);

        // --- Z. ZOOM DYNAMICS ---
        // Cinematic (Intro) = Zoomed IN (Car looks big)
        // Gameplay = Zoomed OUT (See track)
        const CINEMATIC_ZOOM = 75; // Big car look
        const GAMEPLAY_ZOOM = baseZoom; // Use Responsive Zoom (was 15 fixed)

        const targetZoom = hasStarted.current ? GAMEPLAY_ZOOM : CINEMATIC_ZOOM;

        // Lerp Zoom
        if (state.camera instanceof THREE.OrthographicCamera) {
            state.camera.zoom = THREE.MathUtils.lerp(state.camera.zoom, targetZoom, 0.05);
            state.camera.updateProjectionMatrix();
        }







        // --- PARALLAX UTILS ---
        // --- 4. VISUALS ---
        if (chassisRef.current) {
            chassisRef.current.rotation.order = 'YXZ';
            chassisRef.current.rotation.y = currentRotation.current;
            // Tilt / Pitch
            const tilt = (left ? 0.25 : 0) + (right ? -0.25 : 0);
            chassisRef.current.rotation.z = THREE.MathUtils.lerp(chassisRef.current.rotation.z, tilt, 0.1);
            const pitch = (forward ? -0.15 : 0) + (back ? 0.1 : 0);
            chassisRef.current.rotation.x = THREE.MathUtils.lerp(chassisRef.current.rotation.x, pitch, 0.1);
        }

        // Update Arrow Rotation - only in Race Mode
        if (arrowRef.current && isRaceActive && currentCheckpoint < CHECKPOINTS.length) {
            const target = CHECKPOINTS[currentCheckpoint];
            // Point the arrow at the target
            // Use LookAt logic. Since arrowRef is inside 'ref' (which doesn't rotate Y with car), 
            // valid lookAt in world space works if we consider local vs world.
            // Actually 'ref' is the physics body group. 
            // Let's just calculate angle manually.
            const angle = Math.atan2(target.x - pos[0], target.z - pos[2]);
            arrowRef.current.rotation.y = angle - Math.PI; // Adjust offset if needed (arrow points +Z by default?)
            // My arrow points +Z (0,0,1.5). LookAt(Target) works in ThreeJS.
            // Let's rely on lookAt which is easier.
            arrowRef.current.lookAt(target.x, pos[1], target.z);
        }

        // Debug
        if (setDebugInfo) {
            setDebugInfo({
                keys: { forward, back, left, right },
                velocity: velocity.current.map(v => v.toFixed(2)),
                rotation: currentRotation.current.toFixed(2),
                pos: positionRef.current.map(v => v.toFixed(1)),
                checkpoint: currentCheckpoint,
                bounds: `MapZ: [-5, 235]`
            });
        }
    });

    return (
        <group ref={ref as any}>
            <group ref={chassisRef} position={[0, -0.4, 0]}>
                <CyberSportsCar variant={selectedCar} />
            </group>

            {/* Guide Arrow - Only show in RACE MODE */}
            {gameActive.current && isRaceActive && currentCheckpoint < CHECKPOINTS.length && (
                <group ref={arrowRef} position={[0, 0.2, 0]}>
                    <GuideArrow />
                </group>
            )}

            {/* CountDown Overlay moved to Parent */}
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
            <meshStandardMaterial color="#020617" transparent opacity={0} /> {/* Invisible Ground */}
        </mesh>
    );
}


// --- TRACK ROAD RENDERER ---
// --- TRACK POINT GENERATION HELPER ---
function getTrackPoints() {
    const rawPoints: THREE.Vector3[] = [];
    const checkpointIndices: number[] = new Array(CHECKPOINTS.length).fill(0);

    for (let i = 0; i < CHECKPOINTS.length; i++) {
        const current = CHECKPOINTS[i];
        const next = CHECKPOINTS[(i + 1) % CHECKPOINTS.length];

        // Record the index in the dense array for this checkpoint
        checkpointIndices[i] = rawPoints.length;

        // Add Current Point
        rawPoints.push(new THREE.Vector3(current.x, 0.05, current.z));

        // Add intermediate points for straight segments
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

    // Filter duplicates to prevent potential ThreeJS errors
    // We rebuild points and remap indices
    const points: THREE.Vector3[] = [];
    const finalIndices: number[] = new Array(CHECKPOINTS.length).fill(-1);

    // Map from old raw index to new filtered index
    const rawToNewIndex: number[] = new Array(rawPoints.length).fill(-1);

    for (let i = 0; i < rawPoints.length; i++) {
        const p = rawPoints[i];
        const nextIndex = (i + 1) % rawPoints.length;
        const nextP = rawPoints[nextIndex];

        // Simple distance check to distinct points
        if (p.distanceToSquared(nextP) > 0.0001) {
            rawToNewIndex[i] = points.length;
            points.push(p);
        } else {
            // If dropped, map to the next valid point (which is effectively this point's location)
            // But for simple duplicate filtering of adjacents, we can just say:
            // If I am dropped, I point to the *next* index? 
            // Actually, if p == nextP, we keep p and drop nextP?
            // Existing logic dropped 'p' if distinct from next? Wait.
            // if (dist > 0.0001) -> KEEP.
            // else (dist very small) -> DROP.
            // If we drop i, what does index map to?
            // It should validly map to the next kept point.
            // But simpler: Always keep Checkpoints.
            // Since we fixed the typo, we don't expect Checkpoints to be duplicates of each other.
            // So we can assume checkpoints are always kept.
        }
    }

    // Re-map checkpoint (sparse) indices to final dense indices
    for (let i = 0; i < CHECKPOINTS.length; i++) {
        const rawIdx = checkpointIndices[i];
        // Find the new index. If rawIdx was dropped, scan forward?
        // With current data, Checkpoints are never dropped.
        if (rawToNewIndex[rawIdx] !== -1) {
            finalIndices[i] = rawToNewIndex[rawIdx];
        } else {
            // Fallback: This shouldn't happen with valid data.
            finalIndices[i] = 0;
        }
    }

    return { points, indices: finalIndices };
}


// --- TRACK ROAD RENDERER ---
function TrackRoad() {
    const roadGeometry = useMemo(() => {
        // Use shared helper
        const { points } = getTrackPoints();

        if (points.length < 2) return undefined;

        // Create curve
        const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);

        // Create Tube
        const tubeSegments = points.length * 15;
        return new THREE.TubeGeometry(curve, tubeSegments, 6, 8, true);
    }, []);

    if (!roadGeometry) return null;

    return (
        <mesh geometry={roadGeometry} position={[0, 0.02, 0]} scale={[1, 0.001, 1]} receiveShadow>
            <meshStandardMaterial
                color="#1e293b"
                roughness={0.6}
                metalness={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// --- RENDERER COMPONENT ---
function CheckpointRenderer({ currentCheckpoint, theme }: { currentCheckpoint: number, theme?: string }) {
    // Memoize points/indices calculation
    const { points, indices } = useMemo(() => getTrackPoints(), []);

    if (!points || points.length === 0) return null;

    return (
        <>
            {/* <TrackRoad /> - Removed per user request */}
            {CHECKPOINTS.map((cp, idx) => {
                let status: 'active' | 'next' | 'hidden' | 'completed' = 'hidden';
                if (idx < currentCheckpoint) status = 'completed';
                else if (idx === currentCheckpoint) status = 'active';
                else if (idx === currentCheckpoint + 1) status = 'next';

                // Calculate Rotation from Dense Points Tangent
                // Get tangent using finite difference of neighbors in the dense array
                const denseIdx = indices[idx];
                const len = points.length;

                // Neighbors in the closed loop
                const prevP = points[(denseIdx - 1 + len) % len];
                const nextP = points[(denseIdx + 1) % len];

                const dx = nextP.x - prevP.x;
                const dz = nextP.z - prevP.z;

                // If distinct, use atan2. If coincident (shouldn't happen), use 0.
                let angle = Math.atan2(dx, dz);

                // Apply optional manual rotation offset
                if ((cp as any).rotationOffset) {
                    angle += (cp as any).rotationOffset;
                }

                // Apply dynamic color & glow logic
                // Active: Yellow (#FBBF24), High Glow (3)
                // Next (Immediate): Pale Yellow (#FEF9C3), Medium Glow (2)
                // Future (Rest): Grey (#334155), No Glow (0)
                let displayColor = (status === 'active') ? cp.color : "#334155";
                let glow = 0;

                if (status === 'active') {
                    displayColor = cp.color; // #FBBF24 (Matches array)
                    glow = 3;
                } else if (idx === currentCheckpoint + 1) {
                    displayColor = theme === 'light' ? "#000000" : "#FEF9C3";
                    glow = 2;
                } else {
                    // Future / Others
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

// --- IMPORTS ---
import { RaceTimer } from "./RaceTimer";
import { Leaderboard } from "./Leaderboard";

// ... [Existing imports]

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

    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
    const [isGameActive, setIsGameActive] = useState(false); // Controls "Driving" (Input capture)
    const [isRaceActive, setIsRaceActive] = useState(false); // Controls "Race Mode" (Track visible, Timer)

    // Timer State
    const [countdown, setCountdown] = useState<number | string | null>(null); // Lifted State
    const [startTime, setStartTime] = useState<number | null>(null);
    const [finishTime, setFinishTime] = useState<number | null>(null);
    const [resetToken, setResetToken] = useState(0); // NEW: Token to force reset
    // selectedCar state lifted to Parent

    // Sync Game Active State to Parent
    useEffect(() => {
        onGameStateChange?.(isGameActive);
    }, [isGameActive, onGameStateChange]);

    // Reset Race Function
    const resetRace = () => {
        setIsRaceActive(false);
        setStartTime(null);
        setFinishTime(null);
        setCurrentCheckpoint(0);
        setResetToken(prev => prev + 1); // Trigger Physics Reset
    };

    // Responsive Zoom
    const [zoom, setZoom] = useState(15);

    useEffect(() => {
        const handleResize = () => {
            // Dynamic Zoom: Ensure ~100 world units are visible (Track width ~90 + margins).
            // Formula: Zoom = Width / 100.
            // Capped at 15 (Desktop default) to prevent excessive zoom-out on ultra-wide.
            const calculatedZoom = Math.min(15, window.innerWidth / 100);
            setZoom(calculatedZoom);
        };

        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (

        <div className="fixed inset-0 z-50 pointer-events-none"> {/* Global Overlay, clicks pass through */}
            <KeyboardControls map={map}>
                <Canvas shadows dpr={[1, 2]} gl={{ alpha: true }} style={{ background: 'transparent', pointerEvents: 'none' }}>
                    {/* Orthographic Camera for Isometric 'No-Distortion' Look */}
                    <OrthographicCamera makeDefault position={[0, 50, 50]} zoom={zoom} near={-100} far={500} />

                    <ambientLight intensity={0.5} />
                    <directionalLight
                        position={[10, 50, 10]}
                        intensity={1.5}
                        color="#a5b4fc"
                        castShadow
                    />

                    <Physics gravity={[0, -20, 0]}> {/* Stronger gravity to keep car grounded */}
                        <CarController
                            setDebugInfo={setDebugInfo}
                            currentCheckpoint={currentCheckpoint}
                            setCurrentCheckpoint={setCurrentCheckpoint}
                            setIsGameActive={setIsGameActive}
                            isRaceActive={isRaceActive}
                            setIsRaceActive={(active) => {
                                setIsRaceActive(active);
                                if (active) {
                                    setStartTime(Date.now()); // Start Timer
                                    setFinishTime(null);
                                }
                            }}
                            onRaceFinish={() => {
                                if (startTime) {
                                    setFinishTime(Date.now() - startTime);
                                    setIsRaceActive(false);
                                }
                            }}
                            isRaceFinished={!!finishTime} // FIX: Pass completion status
                            resetToken={resetToken} // Pass to controller
                            countdown={countdown}
                            setCountdown={setCountdown}
                            selectedCar={selectedCar}
                            baseZoom={zoom}
                        />
                        <Ground />
                        {/* RACE START PAD */}
                        {isGameActive && !isRaceActive && !finishTime && !countdown && (
                            <RaceStartPad position={[25, 0, 20]} />
                        )}
                    </Physics>

                    {/* RENDER CHECKPOINTS (CONDITIONAL) */}
                    {isGameActive && (isRaceActive || finishTime) && <CheckpointRenderer currentCheckpoint={currentCheckpoint} theme={resolvedTheme} />}


                    {/* COUNTDOWN OVERLAY (Global) */}
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

            {/* UI Overlay */}
            {isGameActive && (
                <>

                    {/* Top Right: Timer */}
                    {isRaceActive && (
                        <div className="absolute top-4 right-4 z-10">
                            <RaceTimer isRunning={true} startTime={startTime} />
                        </div>
                    )}
                </>
            )}

            {/* Conditional Reset Text */}
            {isGameActive && (
                <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-white/50 text-xs font-mono">
                    PRESS 'R' TO RESET CAR | SCROLL TO EXIT
                </div>
            )}

            {/* CAR SELECTOR UI */}


            {/* Leaderboard Modal */}
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
    { name: "Cyber Super", color: "#00aaff", accent: "#ffaa00", bodyStyle: "supercar" }, // Blue
    { name: "Rally Evo", color: "#ef4444", accent: "#fbbf24", bodyStyle: "rally" },      // Red
    { name: "Unknown Tuner", color: "#a855f7", accent: "#22c55e", bodyStyle: "jdm" },     // Purple
    { name: "Royal Phantom", color: "#171717", accent: "#9ca3af", bodyStyle: "rolls" },   // Black
    { name: "Titan 4x4", color: "#ffffff", accent: "#06b6d4", bodyStyle: "offroad" },     // White
];

function CyberSportsCar({ variant = 0 }: { variant?: number }) {
    const { color, accent, bodyStyle } = CAR_VARIANTS[variant] || CAR_VARIANTS[0];
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // --- GEOMETRY VARIATIONS ---
    return (
        <group rotation={[0, 0, 0]}>
            {/* SUPERCAR (Default) */}
            {bodyStyle === 'supercar' && (
                <>
                    {/* Low Sleek Body */}
                    <mesh position={[0, 0.35, 0]}>
                        <boxGeometry args={[1.9, 0.45, 4.1]} />
                        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
                    </mesh>
                    {/* Cockpit - Aerodynamic */}
                    <mesh position={[0, 0.8, -0.1]}>
                        <boxGeometry args={[1.5, 0.5, 2.2]} />
                        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                    </mesh>

                    {/* Rear Diffuser */}
                    <group position={[0, 0.2, 2.0]}>
                        <mesh position={[0, 0, 0]}><boxGeometry args={[1.8, 0.2, 0.2]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[-0.5, 0, 0]}><boxGeometry args={[0.1, 0.3, 0.3]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[0.5, 0, 0]}><boxGeometry args={[0.1, 0.3, 0.3]} /><meshStandardMaterial color="#111" /></mesh>
                    </group>

                    {/* Side Vents */}
                    <mesh position={[0.96, 0.4, 0.5]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.1, 0.3, 1.2]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[-0.96, 0.4, 0.5]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.1, 0.3, 1.2]} /><meshStandardMaterial color="#111" /></mesh>

                    {/* Wing - Proper Pylons (Lowered to connect to body) */}
                    <group position={[0, 0.6, 1.8]}>
                        <mesh position={[0, 0.3, 0]}><boxGeometry args={[2.2, 0.05, 0.6]} /><meshStandardMaterial color={accent} /></mesh>
                        {/* Pylons lowered slightly to not clip through top */}
                        <mesh position={[-0.8, 0.02, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.1, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[0.8, 0.02, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.1, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                    </group>

                    {/* Headlights (Angular LED Strips) - Moved forward to prevent Z-fighting */}
                    <mesh position={[-0.7, 0.45, -2.06]} rotation={[0, 0.2, 0]}> <boxGeometry args={[0.5, 0.1, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.7, 0.45, -2.06]} rotation={[0, -0.2, 0]}> <boxGeometry args={[0.5, 0.1, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>

                    {/* Dark Mode Beams */}
                    {isDark && (
                        <>
                            {/* Beams need to be shifted -Z relative to headlight. Since center is -5, we place them at headlight Z - 5 */}
                            {/* Cylinder is 10 units long centered. So we place mesh at headlight + offset. */}
                            {/* Actually, easier to use rotation. Cylinder Y-axis. Rotate -PI/2 to point -Z. */}
                            {/* Center of cylinder is (0,0,0). Top is (0,5,0), Bottom is (0,-5,0). */}
                            {/* If we rotate -PI/2, Y+ becomes Z-. So (0,0,-5) is end, (0,0,5) is start? No. */}
                            {/* Beams shifted for shorter length (6 vs 10). Center shift 3 vs 5. Headlight approx -2. Center at -2 - 3 = -5 */}
                            <VolumetricBeam position={[-0.7, 0.45, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.7, 0.45, -5]} rotation={[Math.PI / 2, 0, 0]} />
                        </>
                    )}

                    {/* Taillights (Wide thin strip) */}
                    <mesh position={[0, 0.5, 2.01]}> <boxGeometry args={[1.7, 0.1, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {/* RALLY CAR (Hatchback shape, Roof Scoop, Mudflaps) */}
            {bodyStyle === 'rally' && (
                <>
                    {/* Main Body */}
                    <mesh position={[0, 0.45, 0]}>
                        <boxGeometry args={[1.75, 0.65, 3.9]} />
                        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
                    </mesh>
                    {/* Cabin */}
                    <mesh position={[0, 0.95, 0.3]}>
                        <boxGeometry args={[1.55, 0.65, 1.8]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Roof Scoop */}
                    <mesh position={[0, 1.3, -0.4]}>
                        <boxGeometry args={[0.5, 0.15, 0.5]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* Headlights (Quad Rally Pods) */}
                    <mesh position={[-0.5, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>
                    <mesh position={[-0.25, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>
                    <mesh position={[0.25, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>
                    <mesh position={[0.5, 0.5, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /> </mesh>

                    {/* Dark Mode Beams */}
                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.5, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                            <VolumetricBeam position={[-0.25, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                            <VolumetricBeam position={[0.25, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                            <VolumetricBeam position={[0.5, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                        </>
                    )}

                    {/* Mudflaps */}
                    <mesh position={[-0.7, 0.2, 1.3]}><boxGeometry args={[0.4, 0.3, 0.05]} /><meshStandardMaterial color={accent} /></mesh>
                    <mesh position={[0.7, 0.2, 1.3]}><boxGeometry args={[0.4, 0.3, 0.05]} /><meshStandardMaterial color={accent} /></mesh>

                    {/* Rally Wing (Connected strut) - Fixed connections */}
                    <group position={[0, 1.25, 1.7]}>
                        <mesh position={[0, 0, 0]}><boxGeometry args={[1.6, 0.05, 0.4]} /><meshStandardMaterial color={accent} /></mesh>
                        {/* Side Plates */}
                        <mesh position={[-0.8, -0.2, 0.1]}><boxGeometry args={[0.05, 0.5, 0.5]} /><meshStandardMaterial color={accent} /></mesh>
                        <mesh position={[0.8, -0.2, 0.1]}><boxGeometry args={[0.05, 0.5, 0.5]} /><meshStandardMaterial color={accent} /></mesh>
                    </group>

                    {/* Taillights (Vertical Blocks) */}
                    <mesh position={[-0.7, 0.6, 1.96]}> <boxGeometry args={[0.3, 0.3, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.7, 0.6, 1.96]}> <boxGeometry args={[0.3, 0.3, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {/* JDM TUNER (Widebody, Smooth, Underglow) */}
            {bodyStyle === 'jdm' && (
                <>
                    {/* Main Body */}
                    <mesh position={[0, 0.4, 0]}>
                        <boxGeometry args={[1.8, 0.55, 4.1]} />
                        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
                    </mesh>
                    {/* Cabin */}
                    <mesh position={[0, 0.9, -0.2]}>
                        <boxGeometry args={[1.6, 0.6, 2.0]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* Widebody Kit */}
                    <mesh position={[0.95, 0.35, 1.2]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[-0.95, 0.35, 1.2]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[0.95, 0.35, -1.2]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>
                    <mesh position={[-0.95, 0.35, -1.2]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.4, 0.5, 0.9]} /><meshStandardMaterial color={color} /></mesh>

                    {/* Big Exhaust */}
                    <mesh position={[0.6, 0.25, 2.1]} rotation={[0.4, 0.2, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                        <meshStandardMaterial color="#aaa" metalness={1} roughness={0.2} />
                    </mesh>



                    {/* Supra Style Wing (Hoop Spoiler) */}
                    <group position={[0, 0.45, 1.85]}>
                        {/* Curved Side Pillars */}
                        <mesh position={[-0.8, 0.3, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.2, 0.6, 0.4]} /><meshStandardMaterial color={color} /></mesh>
                        <mesh position={[0.8, 0.3, 0]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.2, 0.6, 0.4]} /><meshStandardMaterial color={color} /></mesh>
                        {/* Top Blade */}
                        <mesh position={[0, 0.65, -0.1]}><boxGeometry args={[1.9, 0.1, 0.5]} /><meshStandardMaterial color={color} /></mesh>
                    </group>

                    {/* Headlights (Angry Eyes) */}
                    <mesh position={[-0.6, 0.5, -2.06]} rotation={[0, 0, -0.15]}> <boxGeometry args={[0.5, 0.15, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.6, 0.5, -2.06]} rotation={[0, 0, 0.15]}> <boxGeometry args={[0.5, 0.15, 0.1]} /> <meshStandardMaterial color="#ccffff" emissive="#ccffff" emissiveIntensity={3} /> </mesh>

                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.6, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.6, 0.5, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            {/* Underglow - Soft Neon (Visible only in Dark Mode) */}
                            <SoftUnderglow width={2.2} length={4.2} color="#f000ff" intensity={1.2} />
                        </>
                    )}

                    {/* Taillights (Waitress/Skyline rings) */}
                    <mesh position={[-0.5, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[-0.8, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.5, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.8, 0.6, 2.06]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {/* ROLLS LUXURY (Boxy, Long Hood, Vertical Grill) */}
            {bodyStyle === 'rolls' && (
                <>
                    {/* Massive Slab Body - Two Tone */}
                    <mesh position={[0, 0.55, 0]}>
                        <boxGeometry args={[1.9, 0.85, 4.6]} />
                        <meshStandardMaterial color={color} metalness={0.2} roughness={0.1} />
                        <Edges threshold={15} color="#444" /> {/* Subtle outline */}
                    </mesh>
                    {/* Hood Silver Accent */}
                    <mesh position={[0, 1.0, -1.0]}>
                        <boxGeometry args={[1.4, 0.02, 2.0]} />
                        <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* Cabin (Set back) */}
                    <mesh position={[0, 1.15, 0.6]}>
                        <boxGeometry args={[1.8, 0.65, 2.4]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* Chrome Grille (Vertical Slats) */}
                    <mesh position={[0, 0.65, -2.31]}>
                        <boxGeometry args={[1.0, 0.9, 0.1]} />
                        <meshStandardMaterial color="#e5e5e5" metalness={1} roughness={0} />
                    </mesh>
                    {/* Grille Texture (Simulated with lines) */}
                    {[...Array(5)].map((_, i) => (
                        <mesh key={i} position={[(i - 2) * 0.15, 0.65, -2.36]}>
                            <boxGeometry args={[0.05, 0.85, 0.05]} />
                            <meshStandardMaterial color="#333" />
                        </mesh>
                    ))}

                    {/* Spirit Ornament */}
                    <mesh position={[0, 1.05, -2.25]}>
                        <octahedronGeometry args={[0.1, 0]} />
                        <meshStandardMaterial color="gold" metalness={1} roughness={0} />
                    </mesh>

                    {/* Headlights (Rectangular Boxy) */}
                    <mesh position={[-0.7, 0.7, -2.31]}> <boxGeometry args={[0.3, 0.2, 0.1]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.7, 0.7, -2.31]}> <boxGeometry args={[0.3, 0.2, 0.1]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>

                    {isDark && (
                        <>
                            <VolumetricBeam position={[-0.7, 0.7, -5.3]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.7, 0.7, -5.3]} rotation={[Math.PI / 2, 0, 0]} />
                        </>
                    )}

                    {/* Taillights (Vertical Slim) */}
                    <mesh position={[-0.8, 0.7, 2.31]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.8, 0.7, 2.31]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </>
            )}

            {/* 4x4 OFFROAD (Lifted, Spare Tire) */}
            {bodyStyle === 'offroad' && (
                <group position={[0, 0.25, 0]}> {/* Lowered Lift Kit slightly */}
                    {/* Boxy SUV Body */}
                    <mesh position={[0, 0.7, 0]}>
                        <boxGeometry args={[1.9, 0.9, 3.8]} />
                        <meshStandardMaterial color={color} roughness={0.7} />
                    </mesh>
                    {/* Cabin */}
                    <mesh position={[0, 1.45, -0.2]}>
                        <boxGeometry args={[1.7, 0.7, 2.2]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* Bullbar */}
                    <mesh position={[0, 0.6, -2.0]}>
                        <boxGeometry args={[1.6, 0.4, 0.1]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[0, 0.9, -1.95]} rotation={[0.2, 0, 0]}>
                        <boxGeometry args={[1.2, 0.4, 0.1]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>

                    {/* Spare Tire */}
                    <mesh position={[0, 0.8, 2.0]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 0.35, 16]} />
                        <meshStandardMaterial color="#1f2937" />
                    </mesh>

                    {/* Roof Spotlights (New Individual Lights) */}
                    <group position={[0, 1.82, -1.0]}>
                        {/* Bar Base */}
                        <mesh><boxGeometry args={[1.3, 0.1, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
                        {/* 4 Round Spotlights */}
                        <mesh position={[-0.5, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                        <mesh position={[-0.17, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                        <mesh position={[0.17, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                        <mesh position={[0.5, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
                    </group>

                    {/* Headlights (Round Jeep Style) - Moved forward */}
                    <mesh position={[-0.6, 0.8, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.6, 0.8, -1.96]} rotation={[Math.PI / 2, 0, 0]}> <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} /> <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} /> </mesh>

                    {isDark && (
                        <>
                            {/* Headlights */}
                            <VolumetricBeam position={[-0.6, 0.8, -5]} rotation={[Math.PI / 2, 0, 0]} />
                            <VolumetricBeam position={[0.6, 0.8, -5]} rotation={[Math.PI / 2, 0, 0]} />

                            {/* Roof Spotlights - Angled down slightly & Raised to match bulbs */}
                            {/* Adjusted height calculation: Tip is +3 units from center. Rotation -0.1 tips it UP at the source (back). Bulb at 1.92. Center at ~1.62. */}
                            <VolumetricBeam position={[-0.5, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                            <VolumetricBeam position={[-0.17, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                            <VolumetricBeam position={[0.17, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                            <VolumetricBeam position={[0.5, 1.62, -4.0]} rotation={[Math.PI / 2 - 0.1, 0, 0]} scale={0.6} />
                        </>
                    )}

                    {/* Taillights (Vertical Cage Mounts) */}
                    <mesh position={[-0.85, 0.8, 1.91]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                    <mesh position={[0.85, 0.8, 1.91]}> <boxGeometry args={[0.15, 0.4, 0.1]} /> <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} /> </mesh>
                </group>
            )}


            {/* --- SHARED PARTS --- */}

            {/* WHEELS (Conditionally scaled for Offroad) */}
            <group position={[0, bodyStyle === 'offroad' ? -0.1 : 0, 0]}> {/* Adjust wheel height base */}
                <Wheel
                    position={[-0.95, 0.35, 1.2]}
                    scale={bodyStyle === 'offroad' ? 1.3 : 1}
                    rimColor={bodyStyle === 'rolls' ? '#silver' : undefined}
                />
                <Wheel
                    position={[0.95, 0.35, 1.2]}
                    scale={bodyStyle === 'offroad' ? 1.3 : 1}
                    rimColor={bodyStyle === 'rolls' ? '#silver' : undefined}
                />
                <Wheel
                    position={[-0.95, 0.35, -1.3]}
                    scale={bodyStyle === 'offroad' ? 1.3 : 1}
                    rimColor={bodyStyle === 'rolls' ? '#silver' : undefined}
                />
                <Wheel
                    position={[0.95, 0.35, -1.3]}
                    scale={bodyStyle === 'offroad' ? 1.3 : 1}
                    rimColor={bodyStyle === 'rolls' ? '#silver' : undefined}
                />
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
            {/* Rim */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.52, 16]} />
                <meshStandardMaterial color={rimColor} metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    )
}
