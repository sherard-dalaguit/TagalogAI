import {vapi} from "@/lib/vapi.sdk";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {cn} from "@/lib/utils";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED"
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  userImage: string;
  sessionId: string;
}

const Agent = ({ userName, userId, userImage, sessionId }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  console.log('Agent received userImage:', userImage)

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage: SavedMessage = { role: message.role as any, content: message.transcript };

        setMessages((prev) => [...prev, newMessage]);
      }
    }

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.log('Error', error);

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
    }
  }, [])

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    if (messages.length === 0) {
      console.log('No messages to generate feedback for.');
      router.push('/practice');
      return;
    }

    console.log('Generating feedback for', messages.length, 'messages');

    // 1. Update the session with the transcript
    const sessionRes = await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: messages.map((m, i) => ({
          order: i,
          speaker: m.role === 'assistant' ? 'ai' : 'user',
          text: m.content
        }))
      }),
    });

    if (!sessionRes.ok) {
      console.error('Error updating session transcript');
    }

    // 2. Generate and save feedback
    const feedbackRes = await fetch(`/api/feedback/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        transcript: messages
      }),
    });
    const feedbackData = await feedbackRes.json();

    if (feedbackData.success && feedbackData.data._id) {
      router.push(`/sessions/${sessionId}`);
    } else {
      console.log('Error saving feedback');
      router.push('/');
    }
  }

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      handleGenerateFeedback(messages);
    }
  }, [messages, callStatus, userId, sessionId])

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID)
  }

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);

    await vapi.stop();
  }

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="flex sm:flex-row flex-col gap-10 items-center justify-between w-full">
        <div className="flex items-center justify-center flex-col gap-2 p-7 h-100 bg-linear-to-b from-[#171532] to-[#08090D] rounded-lg border-2 border-[#A39DFF]/50 flex-1 sm:basis-1/2 w-full">
          <div className="z-10 flex items-center justify-center bg-linear-to-l from-[#FFFFFF] to-[#CAC5FE] rounded-full size-30 relative">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />

            {isSpeaking && <span className="absolute inline-flex size-5/6 animate-ping rounded-full bg-[#A39DFF] opacity-75" />}
          </div>

          <h3 className="text-center text-[#CAC5FE] mt-5">AI Speaker</h3>
        </div>

        <div className="bg-linear-to-b from-[#4B4D4F] to-[#4B4D4F33] p-0.5 rounded-2xl flex-1 sm:basis-1/2 w-full h-100 max-md:hidden">
          <div className="flex flex-col gap-2 justify-center items-center p-7 bg-linear-to-b from-[#1A1C20] to-[#08090D] rounded-2xl min-h-full">
            {userImage ? (
              <Image
                src={userImage}
                alt="user avatar"
                width={540}
                height={540}
                className="rounded-full object-cover size-30"
              />
            ) : (
              <div className="flex items-center justify-center bg-zinc-800 rounded-full size-30">
                <span className="text-4xl text-zinc-400">{userName?.charAt(0) || "U"}</span>
              </div>
            )}

            <h3 className="text-center text-[#CAC5FE] mt-5">{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="bg-linear-to-b from-[#4B4D4F] to-[#4B4D4F33] p-0.5 rounded-2xl w-full mt-10">
          <div className="bg-linear-to-b from-[#1A1C20] to-[#08090D] rounded-2xl min-h-12 px-5 py-3 flex items-center justify-center">
            <p key={latestMessage} className={cn('text-lg text-center text-white transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center mt-10">
        {callStatus !== 'ACTIVE' ? (
          <button className="relative inline-block px-7 py-3 font-bold text-sm leading-5 text-white transition-colors duration-150 bg-[#10b981] border border-transparent rounded-full shadow-sm focus:outline-none focus:shadow-2xl active:bg-[#059669] hover:bg-[#059669] min-w-28 cursor-pointer items-center justify-center overflow-visible" onClick={handleCall}>
            <span className={cn('absolute bg-[#10b981] h-[85%] w-[65%] animate-ping rounded-full opacity-75', callStatus !== 'CONNECTING' && 'hidden')} />

            {isCallInactiveOrFinished ? 'Call' : '. . .'}
          </button>
        ) : (
          <button className="inline-block px-7 py-3 text-sm font-bold leading-5 text-white transition-colors duration-150 bg-[#ef4444] border border-transparent rounded-full shadow-sm focus:outline-none focus:shadow-2xl active:bg-[#dc2626] hover:bg-[#dc2626] min-w-28" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  )
}

export default Agent;