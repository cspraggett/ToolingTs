import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateCoilWeight, calculateStopOD } from "@/core/coil-math";

export function CoilCalculator() {
  const [width, setWidth] = useState<string>('48');
  const [gauge, setGauge] = useState<string>('0.060');
  const [id, setId] = useState<string>('20');
  const [od, setOd] = useState<string>('60');
  const [weightToRemove, setWeightToRemove] = useState<string>('5000');

  const stats = useMemo(() => {
    const w = parseFloat(width) || 0;
    const g = parseFloat(gauge) || 0;
    const i = parseFloat(id) || 0;
    const o = parseFloat(od) || 0;
    const wr = parseFloat(weightToRemove) || 0;

    const currentWeight = calculateCoilWeight(w, i, o);
    const stopOD = calculateStopOD(w, i, o, wr);
    const remainingWeight = Math.max(0, currentWeight - wr);

    return {
      currentWeight: Math.round(currentWeight),
      stopOD: stopOD.toFixed(3),
      remainingWeight: Math.round(remainingWeight),
    };
  }, [width, gauge, id, od, weightToRemove]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-semibold">Width (in)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="text-lg py-6"
                placeholder="48.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gauge" className="text-sm font-semibold">Gauge (in)</Label>
              <Input
                id="gauge"
                type="number"
                value={gauge}
                onChange={(e) => setGauge(e.target.value)}
                className="text-lg py-6"
                placeholder="0.060"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-sm font-semibold">Inner Diameter (in)</Label>
              <Input
                id="id"
                type="number"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="text-lg py-6"
                placeholder="20.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="od" className="text-sm font-semibold">Outer Diameter (in)</Label>
              <Input
                id="od"
                type="number"
                value={od}
                onChange={(e) => setOd(e.target.value)}
                className="text-lg py-6"
                placeholder="60.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weightToRemove" className="text-sm font-semibold">Weight to Remove (lbs)</Label>
            <Input
              id="weightToRemove"
              type="number"
              value={weightToRemove}
              onChange={(e) => setWeightToRemove(e.target.value)}
              className="text-lg py-6 border-primary/50 focus-visible:ring-primary"
              placeholder="5000"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-4">
          <Card className="bg-slate-900 text-slate-50 border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Target Stop OD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-black text-white tracking-tighter">
                {stats.stopOD}<span className="text-2xl ml-1 text-slate-400 font-normal">in</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2 p-4">
                <CardDescription className="text-xs font-bold uppercase text-slate-500">Master Weight</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-slate-900">{stats.currentWeight.toLocaleString()} <span className="text-sm font-normal text-slate-500">lbs</span></div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2 p-4">
                <CardDescription className="text-xs font-bold uppercase text-slate-500">Remaining Weight</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-slate-900">{stats.remainingWeight.toLocaleString()} <span className="text-sm font-normal text-slate-500">lbs</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
